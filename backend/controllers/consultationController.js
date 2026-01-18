const ConsultationSession = require('../models/ConsultationSession');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const crypto = require('crypto');

// Generate secure session ID (format: HS-<timestamp>-<random>)
const generateSessionId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = crypto.randomBytes(8).toString('hex');
  return `HS-${timestamp}-${randomStr}`;
};

// Initiate consultation session (doctor starts the session)
exports.initiateSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: 'appointmentId is required' });
    }

    // Find appointment
    const appt = await Appointment.findById(appointmentId);
    if (!appt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Only doctor of this appointment can initiate
    if (String(appt.doctorId) !== String(userId)) {
      return res.status(403).json({ message: 'Only assigned doctor can initiate consultation' });
    }

    // Ensure appointment is confirmed
    if (appt.status !== 'confirmed') {
      return res.status(400).json({ message: 'Appointment must be confirmed before starting consultation' });
    }

    // Check if session already exists
    const existingSession = await ConsultationSession.findOne({ appointmentId });
    if (existingSession && existingSession.status !== 'completed' && existingSession.status !== 'cancelled') {
      return res.status(409).json({ message: 'Active session already exists for this appointment' });
    }

    // Create new session
    const sessionId = generateSessionId();
    const session = new ConsultationSession({
      appointmentId,
      sessionId,
      patientId: appt.patientId,
      doctorId: appt.doctorId,
      consultationType: appt.consultationType,
      status: 'scheduled'
    });

    await session.save();

    res.status(201).json({
      message: 'Consultation session created',
      session,
      sessionToken: sessionId
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Start session (transition from scheduled → live)
exports.startSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    const session = await ConsultationSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Only doctor or patient of this session can start
    if (String(session.doctorId) !== String(userId) && String(session.patientId) !== String(userId)) {
      return res.status(403).json({ message: 'Unauthorized to start this session' });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({ message: 'Session must be in scheduled status to start' });
    }

    session.status = 'live';
    session.startTime = new Date();
    await session.save();

    res.json({ message: 'Session started', session });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// End session (transition from live → completed)
exports.endSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId, notes } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    const session = await ConsultationSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Only doctor can end session officially
    if (String(session.doctorId) !== String(userId)) {
      return res.status(403).json({ message: 'Only assigned doctor can end session' });
    }

    if (session.status !== 'live') {
      return res.status(400).json({ message: 'Only live sessions can be ended' });
    }

    const endTime = new Date();
    const duration = Math.round((endTime - session.startTime) / 60000); // duration in minutes

    session.status = 'completed';
    session.endTime = endTime;
    session.duration = duration;
    if (notes) session.notes = notes;

    await session.save();

    // Update appointment status to completed
    await Appointment.findByIdAndUpdate(session.appointmentId, { status: 'completed' });

    res.json({ message: 'Session ended', session });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Cancel session
exports.cancelSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId, reason } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    const session = await ConsultationSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Doctor or patient can cancel
    if (String(session.doctorId) !== String(userId) && String(session.patientId) !== String(userId)) {
      return res.status(403).json({ message: 'Unauthorized to cancel this session' });
    }

    if (session.status === 'completed' || session.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel completed or already cancelled sessions' });
    }

    session.status = 'cancelled';
    if (reason) session.notes = reason;
    await session.save();

    res.json({ message: 'Session cancelled', session });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get session details
exports.getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ConsultationSession.findOne({ sessionId })
      .populate('appointmentId', 'appointmentDate timeSlot')
      .populate('patientId', 'name email role')
      .populate('doctorId', 'name email specialization role');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get sessions for a user (doctor/patient)
exports.getUserSessions = async (req, res) => {
  try {
    const userId = req.userId;
    const role = (req.userRole || '').toLowerCase();

    let filter = {};
    if (role === 'doctor') {
      filter = { doctorId: userId };
    } else if (role === 'patient') {
      filter = { patientId: userId };
    } else if (role === 'admin') {
      filter = {}; // admin sees all
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const sessions = await ConsultationSession.find(filter)
      .populate('appointmentId', 'appointmentDate timeSlot')
      .populate('patientId', 'name email role')
      .populate('doctorId', 'name email specialization role')
      .sort({ createdAt: -1 });

    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get session token for WebRTC connection (simulated)
exports.getSessionToken = async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.params;

    const session = await ConsultationSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Verify user is part of this session
    if (String(session.doctorId) !== String(userId) && String(session.patientId) !== String(userId)) {
      return res.status(403).json({ message: 'Unauthorized to access this session' });
    }

    if (session.status !== 'live') {
      return res.status(400).json({ message: 'Session is not live' });
    }

    // Simulate token generation (in production, use Twilio/Agora SDK)
    const token = crypto.randomBytes(32).toString('hex');

    res.json({
      message: 'Session token generated',
      sessionId: session.sessionId,
      consultationType: session.consultationType,
      token,
      // In production, include server info here (Twilio API key, room name, etc.)
      simulatedConfig: {
        provider: 'simulated',
        audioEnabled: ['audio', 'video'].includes(session.consultationType),
        videoEnabled: session.consultationType === 'video',
        chatEnabled: ['chat', 'video', 'audio'].includes(session.consultationType)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
