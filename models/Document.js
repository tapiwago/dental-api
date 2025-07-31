const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  documentId: { type: String, unique: true, required: true }, // Custom readable ID
  name: { type: String, required: true },
  originalFileName: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['License', 'Contract', 'Insurance', 'Credential', 'Form', 'Certificate', 'Other'],
    required: true 
  },
  fileType: { type: String }, // .pdf, .doc, .jpg, etc.
  fileSize: { type: Number }, // In bytes
  uploadDate: { type: Date, default: Date.now },
  linkedTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  linkedStageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stage' },
  linkedCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'OnboardingCase' },
  storageUrl: { type: String, required: true },
  storageProvider: { type: String, enum: ['AWS S3', 'Google Drive', 'Local'], default: 'AWS S3' },
  isRequired: { type: Boolean, default: false },
  isVital: { type: Boolean, default: false }, // Critical documents
  status: { 
    type: String, 
    enum: ['Uploaded', 'Processing', 'Approved', 'Rejected', 'Expired'], 
    default: 'Uploaded' 
  },
  // Security and compliance
  isEncrypted: { type: Boolean, default: true },
  accessLevel: { 
    type: String, 
    enum: ['Public', 'Internal', 'Restricted', 'Confidential'], 
    default: 'Internal' 
  },
  expirationDate: { type: Date },
  // Audit trail
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewDate: { type: Date },
  reviewNotes: { type: String },
  // Versioning
  version: { type: String, default: '1.0' },
  parentDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  isLatestVersion: { type: Boolean, default: true },
  // Metadata
  tags: [{ type: String }],
  description: { type: String },
  checksum: { type: String }, // For integrity verification
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
