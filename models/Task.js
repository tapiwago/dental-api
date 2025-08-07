const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskId: { type: String, unique: true, required: true }, // Custom readable ID
  name: { type: String, required: true },
  description: { type: String },
  championId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Multiple assignees
  stageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stage', required: true },
  onboardingCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'OnboardingCase', required: true },
  status: { 
    type: String, 
    enum: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'], 
    default: 'Not Started' 
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  dueDate: { type: Date },
  startDate: { type: Date },
  completedDate: { type: Date },
  estimatedHours: { type: Number },
  actualHours: { type: Number },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  notes: { type: String },
  isRequired: { type: Boolean, default: false }, // Critical tasks
  isBlocking: { type: Boolean, default: false }, // Blocks other tasks
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }], // Task dependencies
  tags: [{ type: String }],
  // Notifications
  reminderSent: { type: Boolean, default: false },
  overdueNotificationSent: { type: Boolean, default: false },
  // Audit trail
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Custom fields for flexibility
  customFields: [{
    key: String,
    value: mongoose.Schema.Types.Mixed,
    type: { type: String, enum: ['text', 'number', 'date', 'boolean', 'select'] }
  }]
}, { 
  timestamps: true,
  strictPopulate: false // Allow population of fields not in schema (for migration compatibility)
});

module.exports = mongoose.model('Task', taskSchema);
