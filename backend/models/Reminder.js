const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['appointment', 'followup', 'consultation'],
    required: true
  },
  linkedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  linkedModel: {
    type: String,
    enum: ['Appointment', 'EHR', 'ConsultationSession'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  reminderDate: {
    type: Date,
    required: true
  },
  // Reminder timing: send X hours before
  reminderHoursBefore: {
    type: Number,
    default: 24 // default 24 hours before
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'dismissed', 'acknowledged'],
    default: 'pending'
  },
  notificationChannels: {
    type: [
      {
        channel: {
          type: String,
          enum: ['console', 'email', 'sms', 'whatsapp', 'push'],
          default: 'console'
        },
        sent: {
          type: Boolean,
          default: false
        },
        sentAt: Date,
        error: String
      }
    ],
    default: [{ channel: 'console', sent: false }]
  },
  // Metadata
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Index for querying pending reminders
reminderSchema.index({ status: 1, reminderDate: 1 });
reminderSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
