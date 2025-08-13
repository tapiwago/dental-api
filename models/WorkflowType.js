const mongoose = require('mongoose');

const workflowTypeSchema = new mongoose.Schema({
  workflowTypeId: { type: String, unique: true, required: true }, // Custom readable ID
  name: { type: String, required: true, unique: true }, // e.g., "Onboarding", "Payroll Management"
  prefix: { type: String, required: true, unique: true, maxlength: 3 }, // e.g., "OB", "PM", "SA"
  description: { type: String },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false }, // Only one can be default
  color: { type: String, default: '#1976d2' }, // For UI display
  // Usage tracking
  totalCases: { type: Number, default: 0 },
  activeCases: { type: Number, default: 0 },
  // Audit trail
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  strictPopulate: false
});

// Ensure only one default workflow type
workflowTypeSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Set all other workflow types to not default
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Generate workflowTypeId if not provided
workflowTypeSchema.pre('save', function(next) {
  if (!this.workflowTypeId) {
    this.workflowTypeId = `WFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

module.exports = mongoose.model('WorkflowType', workflowTypeSchema);
