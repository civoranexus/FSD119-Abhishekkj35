const mongoose = require('mongoose');

const ePrescriptionSchema = new mongoose.Schema({
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConsultationSession',
    default: null
  },
  ehrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EHR',
    default: null
  },
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
  medicines: {
    type: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        dosage: {
          type: String,
          required: true,
          trim: true
        },
        frequency: {
          type: String,
          enum: ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'As needed'],
          required: true
        },
        duration: {
          type: String,
          required: true,
          trim: true
        },
        instructions: {
          type: String,
          default: '',
          trim: true
        }
      }
    ],
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one medicine is required'
    }
  },
  instructions: {
    type: String,
    trim: true,
    default: ''
  },
  followUpDate: {
    type: Date,
    default: null
  },
  issuedAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  // Prescription status
  status: {
    type: String,
    enum: ['active', 'completed', 'revoked'],
    default: 'active'
  },
  // Pharmacy details (optional)
  pharmacyNotes: {
    type: String,
    default: '',
    trim: true
  },
  // Digital signature/hash (immutable verification)
  prescriptionHash: {
    type: String,
    required: true,
    immutable: true
  },
  // Access log for audit
  accessLog: {
    type: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        role: String,
        action: String,
        accessTime: {
          type: Date,
          default: Date.now
        }
      }
    ],
    default: []
  }
}, { timestamps: true });

// Prevent modification of prescription after issuance (except status)
ePrescriptionSchema.pre('findByIdAndUpdate', function(next) {
  const update = this.getUpdate();
  // Allow only status updates and accessLog additions
  const allowedUpdates = ['status', 'pharmacyNotes', 'accessLog'];
  const updateKeys = Object.keys(update);
  
  const hasDisallowedUpdates = updateKeys.some(key => !allowedUpdates.includes(key));
  if (hasDisallowedUpdates) {
    const err = new Error('Prescriptions are immutable after issuance. Only status can be updated.');
    next(err);
  } else {
    next();
  }
});

// Index for faster queries
ePrescriptionSchema.index({ patientId: 1, doctorId: 1, issuedAt: -1 });
ePrescriptionSchema.index({ patientId: 1, status: 1 });
ePrescriptionSchema.index({ doctorId: 1, issuedAt: -1 });

module.exports = mongoose.model('EPrescription', ePrescriptionSchema);
