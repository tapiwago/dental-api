const AuditLog = require('../models/AuditLog');

exports.create = async (req, res) => {
  try {
    const auditLog = new AuditLog(req.body);
    await auditLog.save();
    res.status(201).json(auditLog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { 
      userId, 
      entityType, 
      entityId, 
      action, 
      riskLevel,
      startDate, 
      endDate,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const filter = {};
    
    if (userId) filter.userId = userId;
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = entityId;
    if (action) filter.action = action;
    if (riskLevel) filter.riskLevel = riskLevel;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const auditLogs = await AuditLog.find(filter)
      .populate('userId', 'firstName lastName email role')
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await AuditLog.countDocuments(filter);
    
    res.json({
      auditLogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const auditLog = await AuditLog.findById(req.params.id)
      .populate('userId', 'firstName lastName email role')
      .populate('reviewedBy', 'firstName lastName email');
    if (!auditLog) return res.status(404).json({ error: 'Not found' });
    res.json(auditLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { limit = 20 } = req.query;
    
    const auditLogs = await AuditLog.find({ 
      entityType, 
      entityId 
    })
      .populate('userId', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
      
    res.json(auditLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAsReviewed = async (req, res) => {
  try {
    const { reviewedBy, reviewNotes } = req.body;
    const auditLog = await AuditLog.findByIdAndUpdate(
      req.params.id, 
      { 
        isReviewed: true,
        reviewedBy,
        reviewedAt: new Date(),
        reviewNotes
      }, 
      { new: true }
    );
    if (!auditLog) return res.status(404).json({ error: 'Not found' });
    res.json(auditLog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getSecurityAlerts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const alerts = await AuditLog.find({ 
      riskLevel: { $in: ['High', 'Critical'] },
      isReviewed: false
    })
      .populate('userId', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
      
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getComplianceReport = async (req, res) => {
  try {
    const { complianceFlag, startDate, endDate } = req.query;
    
    const filter = {};
    if (complianceFlag) filter.complianceFlags = complianceFlag;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const logs = await AuditLog.find(filter)
      .populate('userId', 'firstName lastName email role')
      .sort({ createdAt: -1 });
    
    // Generate compliance statistics
    const stats = {
      totalEvents: logs.length,
      riskDistribution: {},
      actionDistribution: {},
      userActivity: {}
    };
    
    logs.forEach(log => {
      // Risk level distribution
      stats.riskDistribution[log.riskLevel] = (stats.riskDistribution[log.riskLevel] || 0) + 1;
      
      // Action distribution
      stats.actionDistribution[log.action] = (stats.actionDistribution[log.action] || 0) + 1;
      
      // User activity
      const userKey = log.userId ? log.userId._id.toString() : 'unknown';
      stats.userActivity[userKey] = (stats.userActivity[userKey] || 0) + 1;
    });
    
    res.json({
      logs,
      statistics: stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
