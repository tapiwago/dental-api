const mongoose = require('mongoose');

const onboardingCaseSchema = new mongoose.Schema({
  caseId: { type: String, unique: true, required: true }, // Custom readable ID - generated automatically
  workflowTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowType' }, // Workflow type reference - optional for backward compatibility
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  startDate: { type: Date, required: true },
  expectedCompletionDate: { type: Date },
  actualCompletionDate: { type: Date },
  assignedChampion: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Team members assigned to this case
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users assigned to this case (for population compatibility)
  status: { 
    type: String, 
    enum: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Planning'], 
    default: 'Not Started' 
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  linkedGuides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowGuide' }],
  notes: { type: String },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
  // Audit trail
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Compliance and tracking
  complianceFlags: [{
    flag: String,
    description: String,
    resolved: { type: Boolean, default: false },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedDate: Date
  }],
  // Key milestones
  milestones: [{
    name: String,
    targetDate: Date,
    completedDate: Date,
    status: { type: String, enum: ['Pending', 'Completed', 'Overdue'], default: 'Pending' }
  }]
}, { 
  timestamps: true,
  strictPopulate: false, // Allow population of fields not in schema (for migration compatibility)
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field to ensure workflowType info is always available
onboardingCaseSchema.virtual('workflowTypeSafe').get(function() {
  if (this.workflowTypeId && typeof this.workflowTypeId === 'object' && this.workflowTypeId?.name) {
    return this.workflowTypeId;
  }
  // Fallback for cases where workflowTypeId is not populated or missing
  return {
    _id: this.workflowTypeId || null,
    name: 'Onboarding', // Default fallback
    prefix: 'OB' // Default fallback
  };
});

// Pre-hook to ensure workflowTypeId is always set for new documents
onboardingCaseSchema.pre('save', async function(next) {
  if (this.isNew && !this.workflowTypeId) {
    try {
      const WorkflowType = this.constructor.model('WorkflowType');
      const defaultWorkflowType = await WorkflowType.findOne({ isDefault: true });
      if (defaultWorkflowType) {
        this.workflowTypeId = defaultWorkflowType._id;
      }
    } catch (error) {
      console.warn('Could not set default workflow type:', error.message);
    }
  }
  next();
});

module.exports = mongoose.model('OnboardingCase', onboardingCaseSchema);
