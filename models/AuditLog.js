const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  logId: { type: String, unique: true, required: true },
  // Action details
  action: { type: String, required: true }, // 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT'
  entityType: { 
    type: String, 
    enum: ['OnboardingCase', 'Task', 'Stage', 'Document', 'WorkflowGuide', 'User', 'Client', 'GuideStep', 'CaseGuideLink', 'WorkflowType'],
    required: true 
  },
  entityId: { type: String, required: true },
  // User information
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String },
  userRole: { type: String },
  // Request context
  ipAddress: { type: String },
  userAgent: { type: String },
  sessionId: { type: String },
  requestId: { type: String },
  // Changes tracking (for UPDATE actions)
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],
  // Additional context
  description: { type: String },
  metadata: {
    requestMethod: String, // GET, POST, PUT, DELETE
    requestUrl: String,
    responseStatus: Number,
    duration: Number, // Request duration in ms
    dataSize: Number, // Response size in bytes
  },
  // Security and compliance
  riskLevel: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Low' 
  },
  complianceFlags: [String], // HIPAA, SOX, GDPR, etc.
  // Categorization
  category: { 
    type: String, 
    enum: ['Security', 'Data', 'User', 'System', 'Business'], 
    default: 'Business' 
  },
  subcategory: String,
  // Status
  isReviewed: { type: Boolean, default: false },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  reviewNotes: { type: String },
  // Retention and archival
  retentionPeriod: { type: Number, default: 365 }, // Days
  archiveDate: { type: Date },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes for performance and compliance queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ riskLevel: 1, isReviewed: 1 });
auditLogSchema.index({ complianceFlags: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
