const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactInfo: {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    primaryContact: { type: String },
    secondaryContact: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'USA' }
    }
  },
  location: { type: String, required: true },
  practiceDetails: {
    practiceType: String,
    numberOfProviders: Number,
    specialties: [String],
    establishedDate: Date,
    licenseNumber: String
  },
  industryType: { 
    type: String, 
    enum: ['Dental', 'Medical', 'Veterinary', 'Other'],
    default: 'Dental'
  },
  status: { 
    type: String, 
    enum: ['Prospect', 'Active', 'Inactive', 'Churned'],
    default: 'Prospect'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  notes: { type: String },
  tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
