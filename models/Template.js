const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  templateId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['OnboardingCase', 'Stage', 'Task', 'WorkflowGuide'], 
    required: true 
  },
  // Template content
  configuration: {
    // For OnboardingCase templates
    defaultStages: [{
      name: String,
      sequence: Number,
      description: String,
      estimatedDuration: Number,
      isRequired: Boolean,
      tasks: [{
        name: String,
        description: String,
        estimatedHours: Number,
        isRequired: Boolean,
        priority: String,
        skillsRequired: [String]
      }]
    }],
    // For Workflow Guide templates
    defaultSteps: [{
      title: String,
      content: String,
      hintType: String,
      mediaType: String,
      sequence: Number
    }],
    // Common settings
    defaultSettings: mongoose.Schema.Types.Mixed
  },
  // Usage and targeting
  industryType: { 
    type: String, 
    enum: ['Dental', 'Medical', 'Veterinary', 'General'],
    default: 'General'
  },
  clientSize: { 
    type: String, 
    enum: ['Small', 'Medium', 'Large', 'Enterprise'], 
    default: 'Medium' 
  },
  complexity: { 
    type: String, 
    enum: ['Simple', 'Standard', 'Complex', 'Enterprise'], 
    default: 'Standard' 
  },
  // Status and lifecycle
  status: { 
    type: String, 
    enum: ['Draft', 'Published', 'Deprecated', 'Archived'], 
    default: 'Draft' 
  },
  version: { type: String, default: '1.0' },
  isDefault: { type: Boolean, default: false }, // Default template for the type
  // Usage analytics
  usageCount: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 }, // Percentage of successful implementations
  averageCompletionTime: { type: Number }, // In days
  // Metadata
  tags: [String],
  categories: [String],
  estimatedDuration: { type: Number }, // Template completion time in days
  estimatedCost: { type: Number },
  // Audit trail
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalDate: { type: Date },
  // Related templates
  parentTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
  childTemplates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Template' }],
  relatedTemplates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Template' }]
}, { timestamps: true });

// Indexes
templateSchema.index({ type: 1, status: 1 });
templateSchema.index({ industryType: 1, clientSize: 1, complexity: 1 });
templateSchema.index({ isDefault: 1, type: 1 });

module.exports = mongoose.model('Template', templateSchema);
