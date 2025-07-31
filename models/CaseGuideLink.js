const mongoose = require('mongoose');

const caseGuideLinkSchema = new mongoose.Schema({
  onboardingCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'OnboardingCase', required: true },
  guideId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowGuide', required: true },
  linkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignmentDate: { type: Date, default: Date.now },
  // Assignment context
  assignmentReason: { type: String },
  specificInstructions: { type: String },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  // Status tracking
  status: { 
    type: String, 
    enum: ['Assigned', 'In Use', 'Completed', 'Skipped', 'Removed'], 
    default: 'Assigned' 
  },
  startedDate: { type: Date },
  completedDate: { type: Date },
  // Usage analytics
  viewCount: { type: Number, default: 0 },
  stepsCompleted: { type: Number, default: 0 },
  totalSteps: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 }, // In minutes
  // Feedback and effectiveness
  userRating: { type: Number, min: 1, max: 5 },
  userFeedback: { type: String },
  wasHelpful: { type: Boolean },
  improvementSuggestions: { type: String },
  // Contextual data
  applicableStages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stage' }],
  applicableTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  customizations: [{
    stepId: { type: mongoose.Schema.Types.ObjectId, ref: 'GuideStep' },
    customContent: String,
    isHidden: { type: Boolean, default: false }
  }],
  // Audit trail
  removedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  removedDate: { type: Date },
  removalReason: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('CaseGuideLink', caseGuideLinkSchema);
