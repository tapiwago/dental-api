const Task = require('../models/Task');
const Document = require('../models/Document');
const OnboardingCase = require('../models/OnboardingCase');
const Stage = require('../models/Stage');
const NotificationService = require('../services/NotificationService');
const AuditLog = require('../models/AuditLog');

// Basic CRUD operations
exports.create = async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      createdBy: req.body.adminId || req.body.createdBy
    });
    
    await task.save();

    // Create audit log
    await AuditLog.create({
      logId: `AUDIT-TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType: 'Task',
      entityId: task._id,
      action: 'CREATE',
      userId: req.body.adminId || req.body.createdBy,
      changes: { created: task.toObject() },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Send notification to assigned user
    if (task.assignedTo) {
      await NotificationService.create({
        title: 'New Task Assigned',
        message: `You have been assigned a new task: "${task.name}"`,
        type: 'Assignment',
        priority: task.priority === 'Critical' ? 'High' : 'Medium',
        userId: task.assignedTo,
        relatedEntity: {
          entityType: 'Task',
          entityId: task._id
        }
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('onboardingCaseId', 'title')
      .populate('stageId', 'name');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createMultiple = async (req, res) => {
  try {
    const { tasks, stage, onboardingCase } = req.body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks array is required' });
    }
    
    if (!stage) {
      return res.status(400).json({ error: 'Stage ID is required' });
    }

    if (!onboardingCase) {
      return res.status(400).json({ error: 'Onboarding case ID is required' });
    }

    // Get current max sequence for the stage
    const existingTasks = await Task.find({ stage }).sort({ sequence: -1 }).limit(1);
    let maxSequence = existingTasks.length > 0 ? existingTasks[0].sequence : 0;

    // Prepare tasks with proper sequence numbers
    const tasksToCreate = tasks.map((taskData, index) => {
      const taskId = `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`;
      
      return {
        taskId: taskId,
        name: taskData.name,
        description: taskData.description,
        priority: taskData.priority || 'Medium',
        status: 'Not Started', // Use valid enum value
        sequence: maxSequence + index + 1,
        stageId: stage,
        onboardingCaseId: onboardingCase,
        estimatedHours: taskData.estimatedHours || 1,
        isRequired: taskData.isRequired !== false,
        createdBy: req.body.createdBy || taskData.createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    // Create all tasks
    const createdTasks = await Task.insertMany(tasksToCreate);
    
    // Create audit logs for each task
    const auditLogs = createdTasks.map((task, index) => ({
      logId: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
      entityType: 'Task',
      entityId: task._id,
      action: 'CREATE',
      userId: req.body.createdBy || task.createdBy,
      changes: { created: task.toObject() },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }));
    
    await AuditLog.insertMany(auditLogs);
    
    res.status(201).json({
      success: true,
      message: `Successfully created ${createdTasks.length} tasks`,
      data: {
        tasks: createdTasks,
        count: createdTasks.length
      }
    });
  } catch (err) {
    console.error('Error creating multiple tasks:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.addMultipleToStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const { tasks } = req.body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks array is required' });
    }
    
    if (!stageId) {
      return res.status(400).json({ error: 'Stage ID is required' });
    }

    // Verify the stage exists and get the onboarding case
    const stage = await Stage.findById(stageId);
    if (!stage) {
      return res.status(404).json({ error: 'Stage not found' });
    }

    const onboardingCase = stage.onboardingCaseId;

    // Get current max sequence for the stage
    const existingTasks = await Task.find({ stageId: stageId }).sort({ sequence: -1 }).limit(1);
    let maxSequence = existingTasks.length > 0 ? existingTasks[0].sequence : 0;

    // Prepare tasks with proper sequence numbers
    const tasksToCreate = tasks.map((taskData, index) => {
      const taskId = `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`;
      
      return {
        taskId: taskId,
        name: taskData.name,
        description: taskData.description,
        priority: taskData.priority || 'Medium',
        status: 'Not Started', // Use valid enum value
        sequence: maxSequence + index + 1,
        stageId: stageId,
        onboardingCaseId: onboardingCase,
        estimatedHours: taskData.estimatedHours || 1,
        isRequired: taskData.isRequired !== false,
        createdBy: req.body.createdBy || taskData.createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    // Create all tasks
    const createdTasks = await Task.insertMany(tasksToCreate);
    
    // Create audit logs for each task
    const auditLogs = createdTasks.map((task, index) => ({
      logId: `AUDIT-STAGE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
      entityType: 'Task',
      entityId: task._id,
      action: 'CREATE',
      userId: req.body.createdBy || task.createdBy,
      changes: { created: task.toObject() },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }));
    
    await AuditLog.insertMany(auditLogs);

    // Send notifications to assigned users
    for (const task of createdTasks) {
      if (task.assignedTo) {
        await NotificationService.create({
          title: 'New Task Assigned',
          message: `You have been assigned a new task: "${task.name}"`,
          type: 'Assignment',
          priority: task.priority === 'Critical' ? 'High' : 'Medium',
          userId: task.assignedTo,
          relatedEntity: {
            entityType: 'Task',
            entityId: task._id
          }
        });
      }
    }
    
    res.status(201).json({
      success: true,
      message: `Successfully added ${createdTasks.length} tasks to stage "${stage.name}"`,
      data: {
        tasks: createdTasks,
        count: createdTasks.length,
        stage: {
          id: stage._id,
          name: stage.name
        }
      }
    });
  } catch (err) {
    console.error('Error adding multiple tasks to stage:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      assignedTo, 
      onboardingCaseId,
      stageId,
      overdue,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (onboardingCaseId) filter.onboardingCaseId = onboardingCaseId;
    if (stageId) filter.stageId = stageId;
    if (overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $in: ['Not Started', 'In Progress'] };
    }

    const skip = (page - 1) * limit;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('onboardingCaseId', 'title')
      .populate('stageId', 'name')
      .sort({ dueDate: 1, priority: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: tasks,
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
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('onboardingCaseId', 'title clientId')
      .populate('stageId', 'name');

    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Get related documents
    const documents = await Document.find({
      taskId: req.params.id
    }).populate('uploadedBy', 'name email');

    res.json({
      success: true,
      data: {
        ...task.toObject(),
        documents
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const oldTask = await Task.findById(req.params.id);
    if (!oldTask) return res.status(404).json({ error: 'Task not found' });

    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, lastModified: new Date() }, 
      { new: true }
    ).populate('assignedTo', 'name email role')
     .populate('onboardingCaseId', 'title');

    // Create audit log
    await AuditLog.create({
      logId: `AUDIT-UPDATE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType: 'Task',
      entityId: task._id,
      action: 'UPDATE',
      userId: req.body.updatedBy,
      changes: {
        old: oldTask.toObject(),
        new: task.toObject()
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Send notifications if status changed
    if (oldTask.status !== task.status) {
      // Notify case admin and team members
      const onboardingCase = await OnboardingCase.findById(task.onboardingCaseId._id)
        .populate('createdBy assignedTeam');

      const notificationRecipients = [
        onboardingCase.createdBy._id,
        ...onboardingCase.assignedTeam.map(member => member._id)
      ].filter(id => id.toString() !== req.body.updatedBy);

      for (const userId of notificationRecipients) {
        await NotificationService.create({
          title: 'Task Status Updated',
          message: `Task "${task.name}" status changed from ${oldTask.status} to ${task.status}`,
          type: 'StatusUpdate',
          priority: 'Medium',
          userId: userId,
          relatedEntity: {
            entityType: 'Task',
            entityId: task._id
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Create audit log
    await AuditLog.create({
      logId: `AUDIT-DELETE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType: 'Task',
      entityId: req.params.id,
      action: 'DELETE',
      userId: req.body.deletedBy,
      changes: { deleted: task.toObject() },
      ipAddress: req.ip
    });

    res.json({ 
      success: true,
      message: 'Task deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Workflow-specific endpoints

// Update task status (for Champions)
exports.updateStatus = async (req, res) => {
  try {
    const { status, updatedBy, comments, timeSpent } = req.body;
    
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('onboardingCaseId', 'title createdBy assignedTeam');

    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Check if user is assigned to this task
    if (task.assignedTo && task.assignedTo._id.toString() !== updatedBy) {
      return res.status(403).json({ error: 'You are not assigned to this task' });
    }

    const oldStatus = task.status;
    task.status = status;
    task.lastModified = new Date();

    if (status === 'Completed') {
      task.completionDate = new Date();
    }

    if (timeSpent) {
      task.actualDuration = timeSpent;
    }

    await task.save();

    // Create audit log
    await AuditLog.create({
      logId: `AUDIT-STATUS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType: 'Task',
      entityId: task._id,
      action: 'STATUS_UPDATE',
      userId: updatedBy,
      changes: { 
        oldStatus, 
        newStatus: status,
        comments,
        timeSpent
      },
      ipAddress: req.ip
    });

    // Send notifications to case stakeholders
    const stakeholders = [
      task.onboardingCaseId.createdBy,
      ...task.onboardingCaseId.assignedTeam
    ].filter(id => id.toString() !== updatedBy);

    for (const stakeholder of stakeholders) {
      await NotificationService.create({
        title: 'Task Status Updated',
        message: `Task "${task.name}" was ${status.toLowerCase()} by ${task.assignedTo.name}${comments ? '. Notes: ' + comments : ''}`,
        type: 'StatusUpdate',
        priority: status === 'Completed' ? 'Medium' : 'Low',
        userId: stakeholder,
        relatedEntity: {
          entityType: 'Task',
          entityId: task._id
        }
      });
    }

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get tasks assigned to a specific user
exports.getMyTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, priority, overdue } = req.query;
    
    const filter = { assignedTo: userId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $in: ['Not Started', 'In Progress'] };
    }

    const tasks = await Task.find(filter)
      .populate('onboardingCaseId', 'title clientId')
      .populate('stageId', 'name')
      .sort({ dueDate: 1, priority: -1 });

    // Group tasks by status for better organization
    const groupedTasks = {
      'Not Started': [],
      'In Progress': [],
      'Completed': [],
      'On Hold': []
    };

    tasks.forEach(task => {
      if (groupedTasks[task.status]) {
        groupedTasks[task.status].push(task);
      }
    });

    res.json({
      success: true,
      data: {
        total: tasks.length,
        overdue: tasks.filter(t => 
          t.dueDate < new Date() && 
          ['Not Started', 'In Progress'].includes(t.status)
        ).length,
        byStatus: groupedTasks,
        tasks
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign task to a user
exports.assignTask = async (req, res) => {
  try {
    const { assignedTo, assignedBy, priority, dueDate } = req.body;
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo,
        priority: priority || task.priority,
        dueDate: dueDate || task.dueDate,
        lastModified: new Date()
      },
      { new: true }
    ).populate('assignedTo', 'name email')
     .populate('onboardingCaseId', 'title');

    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Create audit log
    await AuditLog.create({
      logId: `AUDIT-ASSIGN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType: 'Task',
      entityId: task._id,
      action: 'ASSIGN',
      userId: assignedBy,
      changes: { assignedTo, priority, dueDate },
      ipAddress: req.ip
    });

    // Send notification to assigned user
    await NotificationService.create({
      title: 'Task Assigned',
      message: `You have been assigned to task: "${task.name}" in case "${task.onboardingCaseId.title}"`,
      type: 'Assignment',
      priority: task.priority === 'Critical' ? 'High' : 'Medium',
      userId: assignedTo,
      relatedEntity: {
        entityType: 'Task',
        entityId: task._id
      }
    });

    res.json({
      success: true,
      message: 'Task assigned successfully',
      data: task
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add comments to a task
exports.addComment = async (req, res) => {
  try {
    const { comment, userId } = req.body;
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          comments: {
            text: comment,
            userId,
            timestamp: new Date()
          }
        },
        lastModified: new Date()
      },
      { new: true }
    ).populate('assignedTo', 'name email')
     .populate('comments.userId', 'name email');

    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: task
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get task analytics for a case or stage
exports.getTaskAnalytics = async (req, res) => {
  try {
    const { caseId, stageId, userId } = req.query;
    
    const filter = {};
    if (caseId) filter.onboardingCaseId = caseId;
    if (stageId) filter.stageId = stageId;
    if (userId) filter.assignedTo = userId;

    const tasks = await Task.find(filter);

    // Calculate analytics
    const analytics = {
      total: tasks.length,
      byStatus: {
        'Not Started': tasks.filter(t => t.status === 'Not Started').length,
        'In Progress': tasks.filter(t => t.status === 'In Progress').length,
        'Completed': tasks.filter(t => t.status === 'Completed').length,
        'On Hold': tasks.filter(t => t.status === 'On Hold').length
      },
      byPriority: {
        'Critical': tasks.filter(t => t.priority === 'Critical').length,
        'High': tasks.filter(t => t.priority === 'High').length,
        'Medium': tasks.filter(t => t.priority === 'Medium').length,
        'Low': tasks.filter(t => t.priority === 'Low').length
      },
      overdue: tasks.filter(t => 
        t.dueDate < new Date() && 
        ['Not Started', 'In Progress'].includes(t.status)
      ).length,
      completionRate: tasks.length > 0 ? 
        Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 0,
      avgTimeToComplete: tasks
        .filter(t => t.status === 'Completed' && t.actualDuration)
        .reduce((sum, t) => sum + t.actualDuration, 0) / 
        tasks.filter(t => t.status === 'Completed' && t.actualDuration).length || 0
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
