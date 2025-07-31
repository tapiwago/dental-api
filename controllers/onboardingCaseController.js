const OnboardingCase = require('../models/OnboardingCase');
const Stage = require('../models/Stage');
const Task = require('../models/Task');
const Document = require('../models/Document');
const User = require('../models/User');
const Client = require('../models/Client');
const NotificationService = require('../services/NotificationService');
const AuditLog = require('../models/AuditLog');

// Basic CRUD operations
exports.create = async (req, res) => {
  try {
    const onboardingCase = new OnboardingCase({
      ...req.body,
      createdBy: req.body.adminId || req.body.createdBy
    });
    
    await onboardingCase.save();
    
    // Create audit log
    await AuditLog.create({
      logId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entityType: 'OnboardingCase',
      entityId: onboardingCase._id,
      action: 'CREATE',
      userId: req.body.adminId || req.body.createdBy,
      changes: { created: onboardingCase.toObject() },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Send notification to client
    if (onboardingCase.clientId) {
      await NotificationService.createNotification({
        title: 'Onboarding Case Created',
        message: `Your onboarding case "${onboardingCase.caseId}" has been created and is now ready to start.`,
        type: 'System',
        priority: 'Medium',
        recipientId: onboardingCase.clientId,
        relatedEntityType: 'OnboardingCase',
        relatedEntityId: onboardingCase._id
      });
    }

    const populatedCase = await OnboardingCase.findById(onboardingCase._id)
      .populate('clientId', 'name email')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedChampion', 'firstName lastName email role');

    res.status(201).json({
      success: true,
      message: 'Onboarding case created successfully',
      data: populatedCase
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      clientId, 
      assignedTo, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (clientId) filter.clientId = clientId;
    if (assignedTo) filter.assignedTeam = assignedTo;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const cases = await OnboardingCase.find(filter)
      .populate('clientId', 'name email contactInfo')
      .populate('createdBy', 'name email role')
      .populate('assignedChampion', 'firstName lastName email role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await OnboardingCase.countDocuments(filter);

    res.json({
      success: true,
      data: cases,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const onboardingCase = await OnboardingCase.findById(req.params.id)
      .populate('clientId')
      .populate('createdBy', 'name email role')
      .populate('assignedChampion', 'firstName lastName email role')
      .populate('linkedGuides', 'title description category');

    if (!onboardingCase) return res.status(404).json({ error: 'Onboarding case not found' });

    // Get stages and tasks for this case
    const stages = await Stage.find({ onboardingCaseId: req.params.id })
      .populate('assignedTo', 'name email')
      .sort({ sequence: 1 });

    const tasks = await Task.find({ onboardingCaseId: req.params.id })
      .populate('assignedTo', 'name email')
      .sort({ sequence: 1 });

    const documents = await Document.find({ onboardingCaseId: req.params.id })
      .populate('uploadedBy', 'name email')
      .sort({ uploadDate: -1 });

    res.json({
      success: true,
      data: {
        ...onboardingCase.toObject(),
        stages,
        tasks,
        documents,
        statistics: {
          totalStages: stages.length,
          completedStages: stages.filter(s => s.status === 'Completed').length,
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'Completed').length,
          totalDocuments: documents.length,
          progressPercentage: stages.length > 0 ? 
            Math.round((stages.filter(s => s.status === 'Completed').length / stages.length) * 100) : 0
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const oldCase = await OnboardingCase.findById(req.params.id);
    if (!oldCase) return res.status(404).json({ error: 'Onboarding case not found' });

    const onboardingCase = await OnboardingCase.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, lastModified: new Date() }, 
      { new: true }
    ).populate('clientId', 'name email')
     .populate('assignedChampion', 'firstName lastName email role');

    // Create audit log
    await AuditLog.create({
      logId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entityType: 'OnboardingCase',
      entityId: onboardingCase._id,
      action: 'UPDATE',
      userId: req.body.updatedBy || req.body.adminId,
      changes: {
        old: oldCase.toObject(),
        new: onboardingCase.toObject()
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Send notifications if status changed
    if (oldCase.status !== onboardingCase.status) {
      await NotificationService.createNotification({
        title: 'Case Status Updated',
        message: `Onboarding case "${onboardingCase.caseId}" status changed from ${oldCase.status} to ${onboardingCase.status}`,
        type: 'StatusUpdate',
        priority: 'Medium',
        recipientId: onboardingCase.clientId,
        relatedEntityType: 'OnboardingCase',
        relatedEntityId: onboardingCase._id
      });
    }

    res.json({
      success: true,
      message: 'Onboarding case updated successfully',
      data: onboardingCase
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const onboardingCase = await OnboardingCase.findByIdAndDelete(req.params.id);
    if (!onboardingCase) return res.status(404).json({ error: 'Onboarding case not found' });

    // Create audit log
    await AuditLog.create({
      logId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entityType: 'OnboardingCase',
      entityId: req.params.id,
      action: 'DELETE',
      userId: req.body.deletedBy || req.body.adminId,
      changes: { deleted: onboardingCase.toObject() },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ 
      success: true,
      message: 'Onboarding case deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Workflow-specific endpoints

// Assign team members to a case
exports.assignTeam = async (req, res) => {
  try {
    const { teamMemberIds, assignedBy } = req.body;
    
    const onboardingCase = await OnboardingCase.findByIdAndUpdate(
      req.params.id,
      { 
        $addToSet: { assignedTeam: { $each: teamMemberIds } },
        lastModified: new Date()
      },
      { new: true }
    ).populate('assignedChampion', 'firstName lastName email role');

    if (!onboardingCase) return res.status(404).json({ error: 'Onboarding case not found' });

    // Send notifications to assigned team members
    for (const teamMemberId of teamMemberIds) {
      await NotificationService.createNotification({
        title: 'Assigned to Onboarding Case',
        message: `You have been assigned to onboarding case: "${onboardingCase.caseId}"`,
        type: 'TaskAssigned',
        priority: 'High',
        recipientId: teamMemberId,
        relatedEntityType: 'OnboardingCase',
        relatedEntityId: onboardingCase._id
      });
    }

    // Create audit log
    await AuditLog.create({
      logId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entityType: 'OnboardingCase',
      entityId: onboardingCase._id,
      action: 'ASSIGN_TEAM',
      userId: assignedBy,
      changes: { assignedTeamMembers: teamMemberIds },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Team members assigned successfully',
      data: onboardingCase
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update case status with notifications
exports.updateStatus = async (req, res) => {
  try {
    const { status, updatedBy, comments } = req.body;
    
    const onboardingCase = await OnboardingCase.findById(req.params.id);
    if (!onboardingCase) return res.status(404).json({ error: 'Onboarding case not found' });

    const oldStatus = onboardingCase.status;
    onboardingCase.status = status;
    onboardingCase.lastModified = new Date();
    
    if (status === 'Completed') {
      onboardingCase.completionDate = new Date();
    }

    await onboardingCase.save();

    // Create audit log
    await AuditLog.create({
      logId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entityType: 'OnboardingCase',
      entityId: onboardingCase._id,
      action: 'STATUS_UPDATE',
      userId: updatedBy,
      changes: { 
        oldStatus, 
        newStatus: status,
        comments 
      },
      ipAddress: req.ip
    });

    // Send notifications to stakeholders
    const stakeholders = [
      onboardingCase.clientId,
      onboardingCase.createdBy,
      ...onboardingCase.assignedTeam
    ];

    for (const stakeholder of stakeholders) {
      await NotificationService.createNotification({
        title: 'Case Status Updated',
        message: `Onboarding case "${onboardingCase.caseId}" status updated to: ${status}${comments ? '. Notes: ' + comments : ''}`,
        type: 'StatusUpdate',
        priority: status === 'Completed' ? 'High' : 'Medium',
        recipientId: stakeholder,
        relatedEntityType: 'OnboardingCase',
        relatedEntityId: onboardingCase._id
      });
    }

    res.json({
      success: true,
      message: 'Case status updated successfully',
      data: onboardingCase
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get dashboard summary for admin
exports.getDashboard = async (req, res) => {
  try {
    const { userId, role } = req.query;

    // Get case counts by status
    const statusCounts = await OnboardingCase.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get cases by priority
    const priorityCounts = await OnboardingCase.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Get recent cases
    const recentCases = await OnboardingCase.find()
      .populate('clientId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get overdue cases (cases in progress for more than expected duration)
    const overdueDate = new Date();
    overdueDate.setDays(overdueDate.getDate() - 30); // Cases older than 30 days

    const overdueCases = await OnboardingCase.find({
      status: { $in: ['Not Started', 'In Progress'] },
      expectedCompletionDate: { $lt: new Date() }
    }).populate('clientId', 'name');

    // Role-specific data
    let assignedCases = [];
    if (role !== 'Admin' && userId) {
      assignedCases = await OnboardingCase.find({
        assignedTeam: userId
      }).populate('clientId', 'name');
    }

    res.json({
      success: true,
      data: {
        summary: {
          total: statusCounts.reduce((sum, item) => sum + item.count, 0),
          byStatus: statusCounts.reduce((obj, item) => {
            obj[item._id] = item.count;
            return obj;
          }, {}),
          byPriority: priorityCounts.reduce((obj, item) => {
            obj[item._id] = item.count;
            return obj;
          }, {}),
          overdue: overdueCases.length
        },
        recentCases,
        overdueCases,
        assignedCases: role !== 'Admin' ? assignedCases : []
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get progress report for a case
exports.getProgressReport = async (req, res) => {
  try {
    const onboardingCase = await OnboardingCase.findById(req.params.id)
      .populate('clientId', 'name email')
      .populate('assignedTeam', 'name email role');

    if (!onboardingCase) return res.status(404).json({ error: 'Onboarding case not found' });

    const stages = await Stage.find({ onboardingCaseId: req.params.id }).sort({ sequence: 1 });
    const tasks = await Task.find({ onboardingCaseId: req.params.id }).sort({ sequence: 1 });
    const documents = await Document.find({ onboardingCaseId: req.params.id });

    // Calculate progress metrics
    const totalStages = stages.length;
    const completedStages = stages.filter(s => s.status === 'Completed').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;

    // Get timeline data
    const timeline = await AuditLog.find({
      entityType: 'OnboardingCase',
      entityId: req.params.id
    }).sort({ timestamp: 1 }).limit(20);

    // Calculate estimated completion
    const averageTimePerStage = totalStages > 0 ? 
      stages.reduce((sum, stage) => {
        return sum + (stage.actualDuration || stage.estimatedDuration || 5);
      }, 0) / totalStages : 5;

    const remainingStages = totalStages - completedStages;
    const estimatedDaysToCompletion = remainingStages * averageTimePerStage;

    res.json({
      success: true,
      data: {
        case: onboardingCase,
        progress: {
          stages: {
            total: totalStages,
            completed: completedStages,
            percentage: totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0
          },
          tasks: {
            total: totalTasks,
            completed: completedTasks,
            percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
          },
          documents: {
            total: documents.length,
            pending: documents.filter(d => d.status === 'Pending Review').length,
            approved: documents.filter(d => d.status === 'Approved').length
          }
        },
        timeline,
        estimates: {
          estimatedDaysToCompletion,
          expectedCompletionDate: new Date(Date.now() + (estimatedDaysToCompletion * 24 * 60 * 60 * 1000))
        },
        stages: stages.map(stage => ({
          ...stage.toObject(),
          tasks: tasks.filter(task => task.stageId && task.stageId.toString() === stage._id.toString())
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send reminder emails for overdue tasks
exports.sendReminders = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { reminderType = 'overdue', userId } = req.body;

    const onboardingCase = await OnboardingCase.findById(caseId)
      .populate('assignedTeam', 'name email');

    if (!onboardingCase) return res.status(404).json({ error: 'Onboarding case not found' });

    // Find overdue tasks
    const overdueTasks = await Task.find({
      onboardingCaseId: caseId,
      status: { $in: ['Not Started', 'In Progress'] },
      dueDate: { $lt: new Date() }
    }).populate('assignedTo', 'name email');

    let sentCount = 0;

    // Send reminders to assigned team members
    for (const task of overdueTasks) {
      if (task.assignedTo) {
        await NotificationService.createNotification({
          title: 'Overdue Task Reminder',
          message: `Task "${task.name}" in case "${onboardingCase.caseId}" is overdue. Please update the status.`,
          type: 'Reminder',
          priority: 'High',
          recipientId: task.assignedTo._id,
          relatedEntityType: 'Task',
          relatedEntityId: task._id
        });
        sentCount++;
      }
    }

    // Create audit log
    await AuditLog.create({
      logId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entityType: 'OnboardingCase',
      entityId: caseId,
      action: 'SEND_REMINDERS',
      userId: userId,
      changes: { 
        reminderType,
        overdueTasksCount: overdueTasks.length,
        remindersSent: sentCount
      },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: `Sent ${sentCount} reminder notifications`,
      data: {
        overdueTasksCount: overdueTasks.length,
        remindersSent: sentCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
