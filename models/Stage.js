const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema({
  stageId: { type: String, unique: true, required: true }, // Custom readable ID
  name: { type: String, required: true },
  sequence: { type: Number, required: true },
  description: { type: String },
  onboardingCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'OnboardingCase', required: true },
  championId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Stage champion
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users assigned to this stage
  status: { 
    type: String, 
    enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'], 
    default: 'Not Started' 
  },
  startDate: { type: Date },
  dueDate: { type: Date },
  completedDate: { type: Date },
  estimatedDuration: { type: Number }, // In days
  progress: { type: Number, default: 0, min: 0, max: 100 },
  isRequired: { type: Boolean, default: true },
  isParallel: { type: Boolean, default: false }, // Can run in parallel with other stages
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stage' }], // Stage dependencies
  notes: { type: String },
  // Template/configuration
  isTemplate: { type: Boolean, default: false },
  templateName: { type: String },
  // Compliance
  complianceRequired: { type: Boolean, default: false },
  complianceNotes: { type: String },
  // Audit trail
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  strictPopulate: false // Allow population of fields not in schema (for migration compatibility)
});

module.exports = mongoose.model('Stage', stageSchema);
