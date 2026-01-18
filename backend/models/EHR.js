const mongoose = require('mongoose');

const ehrSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  consultationDate: {
    type: Date,
    required: true
  },
  symptoms: {
    type: [String],
    required: true,
    default: []
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  treatmentPlan: {
    type: String,
    required: true,
    trim: true
  },
  // Encrypted sensitive medical data (base64 encoded)
  encryptedMedicalData: {
    type: String,
    default: null
  },
  // Doctor's private notes (encrypted)
  encryptedNotes: {
    type: String,
    default: null
  },
  // Additional metadata
  prescriptions: {
    type: [
      {
        medicineName: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String
      }
    ],
    default: []
  },
  // Lab/test references
  labTests: {
    type: [
      {
        testName: String,
        result: String,
        date: Date
      }
    ],
    default: []
  },
  // Follow-up appointment details
  followUpDate: {
    type: Date,
    default: null
  },
  // Access log for audit trail
  accessLog: {
    type: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        role: String,
        accessTime: {
          type: Date,
          default: Date.now
        }
      }
    ],
    default: []
  }
}, { timestamps: true });

// Index for faster queries
ehrSchema.index({ patientId: 1, doctorId: 1 });
ehrSchema.index({ patientId: 1, consultationDate: -1 });
ehrSchema.index({ doctorId: 1, consultationDate: -1 });

module.exports = mongoose.model('EHR', ehrSchema);
