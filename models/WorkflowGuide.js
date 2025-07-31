const mongoose = require('mongoose');

const workflowGuideSchema = new mongoose.Schema({
  guideId: { type: String, unique: true, required: true }, // Custom readable ID
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  version: { type: String, default: '1.0' },
  dateCreated: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Guide classification
  category: { 
    type: String, 
    enum: ['Legal', 'Compliance', 'Technical', 'Administrative', 'Training', 'Other'],
    default: 'Other'
  },
  industryType: { 
    type: String, 
    enum: ['Dental', 'Medical', 'Veterinary', 'General'],
    default: 'Dental'
  },
  // Status and availability
  status: { 
    type: String, 
    enum: ['Draft', 'Published', 'Archived', 'Deprecated'], 
    default: 'Draft' 
  },
  isActive: { type: Boolean, default: true },
  isTemplate: { type: Boolean, default: false },
  // Usage and targeting
  targetRoles: [{ 
    type: String, 
    enum: ['Admin', 'Champion', 'Team Member', 'Senior Champion'] 
  }],
  clientTypes: [{ type: String }], // For targeting specific client types
  applicableStages: [{ type: String }], // Which stages this guide applies to
  // Content and structure
  stepCount: { type: Number, default: 0 },
  estimatedReadTime: { type: Number }, // In minutes
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], 
    default: 'Beginner' 
  },
  // Analytics and feedback
  usageCount: { type: Number, default: 0 },
  averageRating: { type: Number, min: 1, max: 5 },
  feedbackCount: { type: Number, default: 0 },
  // Metadata
  tags: [{ type: String }],
  prerequisites: [{ type: String }],
  relatedGuides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowGuide' }],
  // Approval workflow
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalDate: { type: Date },
  reviewDue: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('WorkflowGuide', workflowGuideSchema);
