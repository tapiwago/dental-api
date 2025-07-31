const mongoose = require('mongoose');

const guideStepSchema = new mongoose.Schema({
  stepId: { type: String, unique: true, required: true }, // Custom readable ID
  guideId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowGuide', required: true },
  // References to where this step applies
  stageOrTaskRef: { type: mongoose.Schema.Types.ObjectId },
  referenceType: { type: String, enum: ['Stage', 'Task', 'General'], default: 'General' },
  // Step ordering and structure
  sequence: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  // Content formatting and display
  hintType: { 
    type: String, 
    enum: ['tip', 'warning', 'checklist', 'tutorial', 'info', 'error', 'success'], 
    default: 'info' 
  },
  mediaType: { 
    type: String, 
    enum: ['text', 'markdown', 'html', 'link', 'file', 'video', 'image', 'audio'], 
    default: 'text' 
  },
  // Resources and attachments
  resourceUrl: { type: String },
  resourceName: { type: String },
  resourceSize: { type: Number }, // File size in bytes
  embedCode: { type: String }, // For embedded content
  // Display and interaction options
  isRequired: { type: Boolean, default: false },
  isCollapsible: { type: Boolean, default: true },
  displayTrigger: { 
    type: String, 
    enum: ['onLoad', 'onClick', 'onHover', 'onFocus'], 
    default: 'onLoad' 
  },
  displayPosition: { 
    type: String, 
    enum: ['top', 'bottom', 'left', 'right', 'center', 'popup'], 
    default: 'right' 
  },
  autoHide: { type: Boolean, default: false },
  hideAfter: { type: Number }, // Seconds
  // Conditional display
  showIf: {
    conditions: [{
      field: String,
      operator: { type: String, enum: ['equals', 'notEquals', 'contains', 'greaterThan', 'lessThan'] },
      value: mongoose.Schema.Types.Mixed
    }]
  },
  // Analytics and tracking
  viewCount: { type: Number, default: 0 },
  skipCount: { type: Number, default: 0 },
  helpfulVotes: { type: Number, default: 0 },
  notHelpfulVotes: { type: Number, default: 0 },
  // Metadata
  estimatedReadTime: { type: Number }, // In seconds
  difficultyLevel: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], 
    default: 'Beginner' 
  },
  tags: [{ type: String }],
  keywords: [{ type: String }], // For search
  // Audit trail
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Versioning
  version: { type: String, default: '1.0' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('GuideStep', guideStepSchema);
