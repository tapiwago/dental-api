const GuideStep = require('../models/GuideStep');
const CaseGuideLink = require('../models/CaseGuideLink');
const Stage = require('../models/Stage');
const Task = require('../models/Task');
const OnboardingCase = require('../models/OnboardingCase');

// Get contextual hints for a specific stage
exports.getStageHints = async (req, res) => {
  try {
    const { stageId } = req.params;
    const { caseId } = req.query;
    
    // Find all guides linked to this case
    const linkedGuides = await CaseGuideLink.find({ 
      onboardingCaseId: caseId,
      status: { $in: ['Assigned', 'In Use'] }
    }).populate('guideId');
    
    // Get all guide steps that apply to this stage
    const hints = [];
    for (const link of linkedGuides) {
      const steps = await GuideStep.find({
        guideId: link.guideId._id,
        $or: [
          { stageOrTaskRef: stageId, referenceType: 'Stage' },
          { referenceType: 'General' }
        ],
        isActive: true
      }).sort({ sequence: 1 });
      
      hints.push(...steps.map(step => ({
        ...step.toObject(),
        guideTitle: link.guideId.title,
        guidePriority: link.priority
      })));
    }
    
    // Sort by guide priority and step sequence
    hints.sort((a, b) => {
      const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
      return priorityOrder[a.guidePriority] - priorityOrder[b.guidePriority] || a.sequence - b.sequence;
    });
    
    res.json({
      stageId,
      hintsCount: hints.length,
      hints
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get contextual hints for a specific task
exports.getTaskHints = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { caseId } = req.query;
    
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    // Find all guides linked to this case
    const linkedGuides = await CaseGuideLink.find({ 
      onboardingCaseId: caseId || task.onboardingCaseId,
      status: { $in: ['Assigned', 'In Use'] }
    }).populate('guideId');
    
    // Get all guide steps that apply to this task or its stage
    const hints = [];
    for (const link of linkedGuides) {
      const steps = await GuideStep.find({
        guideId: link.guideId._id,
        $or: [
          { stageOrTaskRef: taskId, referenceType: 'Task' },
          { stageOrTaskRef: task.stageId, referenceType: 'Stage' },
          { referenceType: 'General' }
        ],
        isActive: true
      }).sort({ sequence: 1 });
      
      hints.push(...steps.map(step => ({
        ...step.toObject(),
        guideTitle: link.guideId.title,
        guidePriority: link.priority
      })));
    }
    
    // Sort by relevance (task-specific first, then stage, then general)
    hints.sort((a, b) => {
      const typeOrder = { 'Task': 0, 'Stage': 1, 'General': 2 };
      return typeOrder[a.referenceType] - typeOrder[b.referenceType] || a.sequence - b.sequence;
    });
    
    res.json({
      taskId,
      taskName: task.name,
      hintsCount: hints.length,
      hints
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark a hint as viewed by user
exports.markHintViewed = async (req, res) => {
  try {
    const { stepId } = req.params;
    const { userId } = req.body;
    
    const step = await GuideStep.findByIdAndUpdate(
      stepId,
      { 
        $inc: { viewCount: 1 },
        $addToSet: { viewedBy: userId }
      },
      { new: true }
    );
    
    if (!step) return res.status(404).json({ error: 'Guide step not found' });
    
    res.json({ 
      message: 'Hint marked as viewed',
      viewCount: step.viewCount
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Submit feedback on a hint
exports.submitHintFeedback = async (req, res) => {
  try {
    const { stepId } = req.params;
    const { userId, helpful, comment } = req.body;
    
    const updateFields = {};
    if (helpful === true) {
      updateFields.$inc = { helpfulVotes: 1 };
    } else if (helpful === false) {
      updateFields.$inc = { notHelpfulVotes: 1 };
    }
    
    const step = await GuideStep.findByIdAndUpdate(stepId, updateFields, { new: true });
    
    if (!step) return res.status(404).json({ error: 'Guide step not found' });
    
    // Store detailed feedback if provided
    if (comment) {
      // You could create a separate feedback collection for detailed tracking
      console.log(`Feedback for step ${stepId} from user ${userId}: ${comment}`);
    }
    
    res.json({ 
      message: 'Feedback submitted',
      helpfulVotes: step.helpfulVotes,
      notHelpfulVotes: step.notHelpfulVotes
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get hints dashboard for case overview
exports.getCaseHintsSummary = async (req, res) => {
  try {
    const { caseId } = req.params;
    
    // Get case with stages and tasks
    const onboardingCase = await OnboardingCase.findById(caseId)
      .populate('clientId', 'name')
      .populate('linkedGuides', 'title description category');
    
    if (!onboardingCase) return res.status(404).json({ error: 'Case not found' });
    
    // Get all stages and tasks for this case
    const stages = await Stage.find({ onboardingCaseId: caseId });
    const tasks = await Task.find({ onboardingCaseId: caseId });
    
    // Count total hints available
    let totalHints = 0;
    const stageHintCounts = {};
    const taskHintCounts = {};
    
    for (const guide of onboardingCase.linkedGuides) {
      const guideSteps = await GuideStep.find({ guideId: guide._id, isActive: true });
      totalHints += guideSteps.length;
      
      // Count hints per stage/task
      for (const step of guideSteps) {
        if (step.referenceType === 'Stage' && step.stageOrTaskRef) {
          stageHintCounts[step.stageOrTaskRef] = (stageHintCounts[step.stageOrTaskRef] || 0) + 1;
        } else if (step.referenceType === 'Task' && step.stageOrTaskRef) {
          taskHintCounts[step.stageOrTaskRef] = (taskHintCounts[step.stageOrTaskRef] || 0) + 1;
        }
      }
    }
    
    res.json({
      caseId,
      clientName: onboardingCase.clientId.name,
      linkedGuides: onboardingCase.linkedGuides.length,
      totalHints,
      stages: stages.map(stage => ({
        ...stage.toObject(),
        hintsCount: stageHintCounts[stage._id] || 0
      })),
      tasks: tasks.map(task => ({
        ...task.toObject(),
        hintsCount: taskHintCounts[task._id] || 0
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get guide usage analytics for a case
exports.getGuideUsageForCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    
    const caseGuideLinks = await CaseGuideLink.find({ onboardingCaseId: caseId })
      .populate('guideId', 'title description category');
    
    const usage = [];
    for (const link of caseGuideLinks) {
      const steps = await GuideStep.find({ 
        guideId: link.guideId._id,
        isActive: true 
      });
      
      const totalViews = steps.reduce((sum, step) => sum + step.viewCount, 0);
      const avgRating = steps.length > 0 ? 
        steps.reduce((sum, step) => sum + (step.helpfulVotes - step.notHelpfulVotes), 0) / steps.length : 0;
      
      usage.push({
        guide: link.guideId,
        linkStatus: link.status,
        assignmentDate: link.assignmentDate,
        stepsCompleted: link.stepsCompleted,
        totalSteps: steps.length,
        completionRate: steps.length > 0 ? (link.stepsCompleted / steps.length * 100).toFixed(1) : 0,
        totalViews,
        timeSpent: link.timeSpent,
        userRating: link.userRating,
        avgStepRating: avgRating.toFixed(1)
      });
    }
    
    res.json({
      caseId,
      guides: usage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const guideStep = new GuideStep(req.body);
    await guideStep.save();
    res.status(201).json(guideStep);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { guideId, referenceType, isActive } = req.query;
    const filter = {};
    
    if (guideId) filter.guideId = guideId;
    if (referenceType) filter.referenceType = referenceType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const steps = await GuideStep.find(filter)
      .populate('guideId', 'title description')
      .sort({ sequence: 1 });
    res.json(steps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const step = await GuideStep.findById(req.params.id)
      .populate('guideId', 'title description category');
    if (!step) return res.status(404).json({ error: 'Not found' });
    res.json(step);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const step = await GuideStep.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!step) return res.status(404).json({ error: 'Not found' });
    res.json(step);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const step = await GuideStep.findByIdAndDelete(req.params.id);
    if (!step) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
