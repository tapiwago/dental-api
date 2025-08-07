const Stage = require('../models/Stage');

exports.create = async (req, res) => {
  try {
    const stage = new Stage(req.body);
    await stage.save();
    res.status(201).json(stage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createMultiple = async (req, res) => {
  try {
    const { stages, onboardingCase } = req.body;
    
    if (!stages || !Array.isArray(stages)) {
      return res.status(400).json({ error: 'Stages array is required' });
    }
    
    if (!onboardingCase) {
      return res.status(400).json({ error: 'Onboarding case ID is required' });
    }

    // Get current max sequence for the case
    const existingStages = await Stage.find({ onboardingCaseId: onboardingCase }).sort({ sequence: -1 }).limit(1);
    let maxSequence = existingStages.length > 0 ? existingStages[0].sequence : 0;

    // Prepare stages with proper sequence numbers and correct field names
    const stagesToCreate = stages.map((stageData, index) => {
      const stageId = `STAGE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`;
      
      return {
        stageId: stageId,
        name: stageData.name,
        description: stageData.description,
        onboardingCaseId: onboardingCase,
        sequence: maxSequence + index + 1,
        status: 'Not Started', // Use valid enum value
        estimatedDuration: stageData.estimatedDuration || 0,
        isRequired: stageData.isRequired !== false,
        createdBy: stageData.createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    // Create all stages
    const createdStages = await Stage.insertMany(stagesToCreate);
    
    res.status(201).json({
      message: `Successfully created ${createdStages.length} stages`,
      stages: createdStages,
      count: createdStages.length
    });
  } catch (err) {
    console.error('Error creating multiple stages:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.createWithTasks = async (req, res) => {
  try {
    const { stages, onboardingCase } = req.body;
    
    if (!stages || !Array.isArray(stages)) {
      return res.status(400).json({ error: 'Stages array is required' });
    }
    
    if (!onboardingCase) {
      return res.status(400).json({ error: 'Onboarding case ID is required' });
    }

    // Import Task model for creating tasks
    const Task = require('../models/Task');

    // Get current max sequence for the case
    const existingStages = await Stage.find({ onboardingCaseId: onboardingCase }).sort({ sequence: -1 }).limit(1);
    let maxSequence = existingStages.length > 0 ? existingStages[0].sequence : 0;

    const results = [];

    // Process each stage
    for (let i = 0; i < stages.length; i++) {
      const stageData = stages[i];
      maxSequence += 1;

      // Generate unique stageId
      const stageId = `STAGE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create the stage with correct field names and valid status
      const stage = new Stage({
        stageId: stageId,
        name: stageData.name,
        description: stageData.description,
        onboardingCaseId: onboardingCase,
        sequence: maxSequence,
        status: 'Not Started', // Use valid enum value
        estimatedDuration: stageData.estimatedDuration || 0,
        isRequired: stageData.isRequired !== false,
        createdBy: stageData.createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await stage.save();

      // Create tasks for this stage if any
      const createdTasks = [];
      if (stageData.tasks && Array.isArray(stageData.tasks)) {
        for (let j = 0; j < stageData.tasks.length; j++) {
          const taskData = stageData.tasks[j];
          
          // Generate unique taskId
          const taskId = `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${j}`;
          
          const task = new Task({
            taskId: taskId,
            name: taskData.name,
            description: taskData.description,
            priority: taskData.priority || 'Medium',
            status: 'Not Started', // Use valid enum value for tasks too
            sequence: j + 1,
            stageId: stage._id,
            onboardingCaseId: onboardingCase,
            estimatedHours: taskData.estimatedHours || 1,
            isRequired: taskData.isRequired !== false,
            createdBy: taskData.createdBy,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          await task.save();
          createdTasks.push(task);
        }
      }

      results.push({
        stage,
        tasks: createdTasks
      });
    }

    res.status(201).json({
      message: `Successfully created ${results.length} stages with tasks`,
      results,
      totalStages: results.length,
      totalTasks: results.reduce((sum, result) => sum + result.tasks.length, 0)
    });
  } catch (err) {
    console.error('Error creating stages with tasks:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const stages = await Stage.find();
    res.json(stages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const stage = await Stage.findById(req.params.id);
    if (!stage) return res.status(404).json({ error: 'Not found' });
    res.json(stage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const stage = await Stage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!stage) return res.status(404).json({ error: 'Not found' });
    res.json(stage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const stage = await Stage.findByIdAndDelete(req.params.id);
    if (!stage) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
