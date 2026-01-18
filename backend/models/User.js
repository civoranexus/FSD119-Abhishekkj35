const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Common fields for all roles
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/  // Basic email validation
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        match: /^[0-9\-\+\(\)]{10,15}$/  // Phone number validation
  },
  password: {
    type: String,
      required: true,
      minlength: 6  // Enforce minimum password length
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
    },

    // Patient-specific fields
    age: {
        type: Number,
        required: function () { return this.role === 'patient'; },
        min: 1,
        max: 150
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: function () { return this.role === 'patient'; }
    },
    village: {
        type: String,
        required: function () { return this.role === 'patient'; },
        trim: true
    },

    // Doctor-specific fields
    specialization: {
        type: String,
        required: function () { return this.role === 'doctor'; },
        enum: [
            'General Practitioner',
            'Cardiology',
            'Dermatology',
            'Orthopedics',
            'Gynecology',
            'Pediatrics',
            'Psychiatry',
            'Neurology',
            'Dentistry',
            'Other'
        ],
        trim: true
    },
    yearsOfExperience: {
        type: Number,
        required: function () { return this.role === 'doctor'; },
        min: 0,
        max: 70
    },
    availabilitySlots: {
        type: [
            {
                day: {
                    type: String,
                    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                },
                startTime: String,  // HH:mm format
                endTime: String,    // HH:mm format
                isAvailable: {
                    type: Boolean,
                    default: true
                }
            }
        ],
        default: []
  }
}, { timestamps: true });

// Index for faster queries
userSchema.index({ email: 1, role: 1 });

module.exports = mongoose.model('User', userSchema);
