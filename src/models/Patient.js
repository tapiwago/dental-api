const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  medicalHistory: [{
    condition: String,
    medications: [String],
    allergies: [String],
    notes: String
  }],
  appointments: [{
    date: Date,
    time: String,
    type: String,
    notes: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled'
    }
  }]
}, {
  timestamps: true
});

// Indexes
patientSchema.index({ email: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ lastName: 1, firstName: 1 });

module.exports = mongoose.model('Patient', patientSchema);
