const WorkflowType = require('../models/WorkflowType');
const AuditLog = require('../models/AuditLog');

// Basic CRUD operations
exports.create = async (req, res) => {
  try {
    // Generate unique workflowTypeId if not provided
    if (!req.body.workflowTypeId) {
      req.body.workflowTypeId = `WFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const workflowType = new WorkflowType({
      ...req.body,
      createdBy: req.body.adminId || req.body.createdBy
    });
    
    await workflowType.save();

    // Create audit log
    await AuditLog.create({
      logId: `AUDIT-WFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType: 'WorkflowType',
      entityId: workflowType._id,
      action: 'CREATE',
      userId: req.body.adminId || req.body.createdBy,
      changes: { created: workflowType.toObject() },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      data: workflowType,
      message: 'Workflow type created successfully'
    });
  } catch (err) {
    console.error('Error creating workflow type:', err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { isActive, search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    // Build filter
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { prefix: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const workflowTypes = await WorkflowType.find(filter)
      .sort(sort)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    res.json({
      success: true,
      data: workflowTypes,
      count: workflowTypes.length
    });
  } catch (err) {
    console.error('Error fetching workflow types:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const workflowType = await WorkflowType.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');
      
    if (!workflowType) {
      return res.status(404).json({ 
        success: false,
        error: 'Workflow type not found' 
      });
    }
    
    res.json({
      success: true,
      data: workflowType
    });
  } catch (err) {
    console.error('Error fetching workflow type:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      lastModifiedBy: req.body.adminId || req.body.lastModifiedBy
    };

    const oldWorkflowType = await WorkflowType.findById(id);
    if (!oldWorkflowType) {
      return res.status(404).json({ 
        success: false,
        error: 'Workflow type not found' 
      });
    }

    const workflowType = await WorkflowType.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    // Create audit log
    await AuditLog.create({
      logId: `AUDIT-WFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType: 'WorkflowType',
      entityId: workflowType._id,
      action: 'UPDATE',
      userId: req.body.adminId || req.body.lastModifiedBy,
      changes: {
        before: oldWorkflowType.toObject(),
        after: workflowType.toObject()
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: workflowType,
      message: 'Workflow type updated successfully'
    });
  } catch (err) {
    console.error('Error updating workflow type:', err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const workflowType = await WorkflowType.findById(id);
    if (!workflowType) {
      return res.status(404).json({ 
        success: false,
        error: 'Workflow type not found' 
      });
    }

    // Check if workflow type is being used in onboarding cases
    const OnboardingCase = require('../models/OnboardingCase');
    const casesCount = await OnboardingCase.countDocuments({ 
      workflowTypeId: id 
    });

    if (casesCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete workflow type. It is being used by ${casesCount} case(s). Please reassign or complete those cases first.`
      });
    }

    await WorkflowType.findByIdAndDelete(id);

    // Create audit log
    await AuditLog.create({
      logId: `AUDIT-WFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType: 'WorkflowType',
      entityId: id,
      action: 'DELETE',
      userId: req.body.adminId || req.body.deletedBy,
      changes: { deleted: workflowType.toObject() },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Workflow type deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting workflow type:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.setDefault = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Set all workflow types to not default
    await WorkflowType.updateMany({}, { isDefault: false });
    
    // Set the specified one as default
    const workflowType = await WorkflowType.findByIdAndUpdate(
      id,
      { 
        isDefault: true,
        lastModifiedBy: req.body.adminId || req.body.lastModifiedBy
      },
      { new: true }
    );

    if (!workflowType) {
      return res.status(404).json({ 
        success: false,
        error: 'Workflow type not found' 
      });
    }

    // Create audit log
    await AuditLog.create({
      logId: `AUDIT-WFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType: 'WorkflowType',
      entityId: id,
      action: 'SET_DEFAULT',
      userId: req.body.adminId || req.body.lastModifiedBy,
      changes: { setAsDefault: true },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: workflowType,
      message: 'Default workflow type updated successfully'
    });
  } catch (err) {
    console.error('Error setting default workflow type:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.getActive = async (req, res) => {
  try {
    const workflowTypes = await WorkflowType.find({ isActive: true })
      .sort({ name: 1 })
      .select('name prefix description color isDefault');

    res.json({
      success: true,
      data: workflowTypes
    });
  } catch (err) {
    console.error('Error fetching active workflow types:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.getDefault = async (req, res) => {
  try {
    const defaultWorkflowType = await WorkflowType.findOne({ 
      isDefault: true, 
      isActive: true 
    });

    if (!defaultWorkflowType) {
      return res.status(404).json({
        success: false,
        error: 'No default workflow type found'
      });
    }

    res.json({
      success: true,
      data: defaultWorkflowType
    });
  } catch (err) {
    console.error('Error fetching default workflow type:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};
