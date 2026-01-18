const mongoose = require('mongoose');

const consultationSessionSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
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
  consultationType: {
    type: String,
    enum: ['audio', 'video', 'chat'],
    default: 'audio'  // audio-first for low-bandwidth
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

consultationSessionSchema.index({ patientId: 1, doctorId: 1, status: 1 });
consultationSessionSchema.index({ appointmentId: 1 });

module.exports = mongoose.model('ConsultationSession', consultationSessionSchema);
