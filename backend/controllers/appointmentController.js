const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Helpers
const isSameDay = (d1, d2) => {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// Validate timeSlot (expects 'HH:mm') and check within start/end (HH:mm)
const isTimeWithin = (timeSlot, startTime, endTime) => {
  try {
    const t = toMinutes(timeSlot);
    const s = toMinutes(startTime);
    const e = toMinutes(endTime);
    return t >= s && t < e; // start inclusive, end exclusive
  } catch (e) {
    return false;
  }
};

// Patient books an appointment
exports.createAppointment = async (req, res) => {
  try {
    const patientId = req.userId;
    const { doctorId, appointmentDate, timeSlot, consultationType } = req.body;

    if (!doctorId || !appointmentDate || !timeSlot || !consultationType) {
      return res.status(400).json({ message: 'doctorId, appointmentDate, timeSlot, consultationType are required' });
    }

    const apptDate = new Date(appointmentDate);
    const now = new Date();
    if (isNaN(apptDate.getTime())) return res.status(400).json({ message: 'Invalid appointmentDate' });
    if (apptDate <= now) return res.status(400).json({ message: 'Appointment must be in the future' });

    // Ensure doctor exists and has role doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({ message: 'Specified doctor not found' });
    }

    // Validate doctor availability for the day and time
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dayName = dayNames[apptDate.getDay()];

    const matchingSlot = (doctor.availabilitySlots || []).find(s => s.day === dayName && s.isAvailable && isTimeWithin(timeSlot, s.startTime, s.endTime));
    if (!matchingSlot) {
      return res.status(400).json({ message: 'Doctor not available at requested day/time' });
    }

    // Prevent double booking: check existing appointments for same doctor, same date & timeSlot not cancelled
    const existing = await Appointment.findOne({
      doctorId,
      appointmentDate: {
        $gte: new Date(apptDate.getFullYear(), apptDate.getMonth(), apptDate.getDate(), 0, 0, 0),
        $lt: new Date(apptDate.getFullYear(), apptDate.getMonth(), apptDate.getDate()+1, 0, 0, 0)
      },
      timeSlot,
      status: { $ne: 'cancelled' }
    });

    if (existing) {
      return res.status(409).json({ message: 'Time slot already booked for this doctor' });
    }

    const appt = new Appointment({
      patientId,
      doctorId,
      appointmentDate: apptDate,
      timeSlot,
      consultationType
    });

    await appt.save();
    res.status(201).json({ message: 'Appointment requested', appointment: appt });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Doctor updates status (confirm/complete/cancel)
exports.updateStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending','confirmed','completed','cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    // Only the assigned doctor can change status (or admin via separate route)
    if (String(appt.doctorId) !== String(userId)) {
      return res.status(403).json({ message: 'Forbidden: only assigned doctor can update status' });
    }

    // If confirming, ensure no other confirmed appointment exists for same doctor/date/timeSlot
    if (status === 'confirmed') {
      const apptDate = new Date(appt.appointmentDate);
      const conflict = await Appointment.findOne({
        _id: { $ne: appt._id },
        doctorId: appt.doctorId,
        appointmentDate: {
          $gte: new Date(apptDate.getFullYear(), apptDate.getMonth(), apptDate.getDate(), 0, 0, 0),
          $lt: new Date(apptDate.getFullYear(), apptDate.getMonth(), apptDate.getDate()+1, 0, 0, 0)
        },
        timeSlot: appt.timeSlot,
        status: 'confirmed'
      });

      if (conflict) return res.status(409).json({ message: 'Conflict: another appointment already confirmed for this slot' });
    }

    appt.status = status;
    await appt.save();

    res.json({ message: 'Status updated', appointment: appt });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Doctor sets availability slots
exports.setAvailability = async (req, res) => {
  try {
    const userId = req.userId;
    const { availabilitySlots } = req.body;

    if (!Array.isArray(availabilitySlots)) return res.status(400).json({ message: 'availabilitySlots must be an array' });

    // Basic validation of slots
    for (const s of availabilitySlots) {
      if (!s.day || !s.startTime || !s.endTime) return res.status(400).json({ message: 'Each slot requires day, startTime and endTime' });
      // validate day
      const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
      if (!days.includes(s.day)) return res.status(400).json({ message: `Invalid day: ${s.day}` });
      // validate time format HH:mm
      if (!/^\d{2}:\d{2}$/.test(s.startTime) || !/^\d{2}:\d{2}$/.test(s.endTime)) return res.status(400).json({ message: 'startTime/endTime must be HH:mm' });
      if (toMinutes(s.startTime) >= toMinutes(s.endTime)) return res.status(400).json({ message: 'startTime must be before endTime' });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'doctor') return res.status(403).json({ message: 'Only doctors can set availability' });

    user.availabilitySlots = availabilitySlots;
    await user.save();

    res.json({ message: 'Availability updated', availabilitySlots: user.availabilitySlots });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get appointments: admin sees all, doctor sees own, patient sees own
exports.getAppointments = async (req, res) => {
  try {
    const userId = req.userId;
    const role = (req.userRole || '').toLowerCase();

    let filter = {};
    if (role === 'admin') {
      filter = {};
    } else if (role === 'doctor') {
      filter = { doctorId: userId };
    } else if (role === 'patient') {
      filter = { patientId: userId };
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const appts = await Appointment.find(filter).populate('patientId', 'name email role village').populate('doctorId', 'name email role specialization');
    res.json({ appointments: appts });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Optional: admin can change any appointment status
exports.adminUpdateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending','confirmed','completed','cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    appt.status = status;
    await appt.save();

    res.json({ message: 'Status updated by admin', appointment: appt });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
