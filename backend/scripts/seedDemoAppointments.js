require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const User = require(path.join(__dirname, '..', 'models', 'User'));
const Appointment = require(path.join(__dirname, '..', 'models', 'Appointment'));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthvillage';

async function seedAppointments() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for appointment seeding');

    const patient = await User.findOne({ email: 'patient@demo.com' });
    const doctor = await User.findOne({ email: 'doctor@demo.com' });

    if (!patient || !doctor) {
      console.error('Demo patient or doctor user not found. Run seedDemoUsers.js first.');
      process.exit(1);
    }

    // Ensure doctor has availability for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dayName = dayNames[tomorrow.getDay()];

    if (!doctor.availabilitySlots || !doctor.availabilitySlots.find(s => s.day === dayName)) {
      doctor.availabilitySlots = doctor.availabilitySlots || [];
      doctor.availabilitySlots.push({ day: dayName, startTime: '09:00', endTime: '17:00', isAvailable: true });
      await doctor.save();
      console.log(`Added availability for doctor on ${dayName}`);
    }

    // Create sample appointments (if not present)
    const appointmentDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    const slots = ['09:00 - 09:30', '10:00 - 10:30'];

    for (const slot of slots) {
      const exists = await Appointment.findOne({ doctorId: doctor._id, patientId: patient._id, appointmentDate, timeSlot: slot });
      if (!exists) {
        const appt = new Appointment({
          patientId: patient._id,
          doctorId: doctor._id,
          appointmentDate,
          timeSlot: slot,
          consultationType: 'audio',
          status: 'confirmed'
        });
        await appt.save();
        console.log(`Created appointment at ${slot}`);
      } else {
        console.log(`Appointment already exists at ${slot}`);
      }
    }

    console.log('Appointment seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding appointments error:', err);
    process.exit(1);
  }
}

seedAppointments();
