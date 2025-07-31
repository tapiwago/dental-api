const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationId: { type: String, unique: true, required: true },
  // Recipients
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientEmail: { type: String },
  // Notification content
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['TaskAssigned', 'TaskOverdue', 'StatusUpdate', 'DocumentUploaded', 'GuideAssigned', 'CaseCompleted', 'Reminder', 'System'], 
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  // Related entities
  relatedEntityType: { 
    type: String, 
    enum: ['OnboardingCase', 'Task', 'Stage', 'Document', 'WorkflowGuide', 'User', 'Client'] 
  },
  relatedEntityId: { type: mongoose.Schema.Types.ObjectId },
  // Delivery channels
  channels: [{
    type: { type: String, enum: ['email', 'inApp', 'sms', 'push'], required: true },
    status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'], default: 'pending' },
    sentAt: Date,
    deliveredAt: Date,
    failureReason: String
  }],
  // Status and tracking
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'read', 'dismissed', 'failed'], 
    default: 'pending' 
  },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  isDismissed: { type: Boolean, default: false },
  dismissedAt: { type: Date },
  // Scheduling
  scheduledFor: { type: Date },
  expiresAt: { type: Date },
  // Metadata
  metadata: {
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    triggerEvent: String,
    templateUsed: String,
    variables: mongoose.Schema.Types.Mixed
  },
  // Retry logic
  retryCount: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 3 },
  nextRetryAt: { type: Date }
}, { timestamps: true });

// Indexes for performance
notificationSchema.index({ recipientId: 1, status: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
