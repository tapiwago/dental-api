const mongoose = require('mongoose');

const onboardingCaseSchema = new mongoose.Schema({
  caseId: { type: String, unique: true, required: true }, // Custom readable ID
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  startDate: { type: Date, required: true },
  expectedCompletionDate: { type: Date },
  actualCompletionDate: { type: Date },
  assignedChampion: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Team members assigned to this case
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users assigned to this case (for population compatibility)
  status: { 
    type: String, 
    enum: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'], 
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
  strictPopulate: false // Allow population of fields not in schema (for migration compatibility)
});

module.exports = mongoose.model('OnboardingCase', onboardingCaseSchema);
