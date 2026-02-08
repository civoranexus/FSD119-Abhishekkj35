const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  appointmentDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  consultationType: {
    type: String,
    enum: ['audio', 'video', 'chat'],
    required: true
  }
}, { timestamps: true });

appointmentSchema.index({ doctorId: 1, patientId: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
