const Reminder = require('../models/Reminder');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const EHR = require('../models/EHR');
const ConsultationSession = require('../models/ConsultationSession');
const { sendNotification, triggerPendingReminders } = require('../utils/notificationService');

// Create reminder for appointment
exports.createAppointmentReminder = async (req, res) => {
  try {
    const { appointmentId, reminderHoursBefore = 24, notificationChannels = ['console'] } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: 'appointmentId is required' });
    }

    // Fetch appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Calculate reminder date
    const reminderDate = new Date(appointment.appointmentDate);
    reminderDate.setHours(reminderDate.getHours() - reminderHoursBefore);

    const reminder = new Reminder({
      userId: appointment.patientId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      type: 'appointment',
      linkedId: appointmentId,
      linkedModel: 'Appointment',
      title: `Appointment reminder with doctor`,
      description: `You have an appointment on ${appointment.appointmentDate.toDateString()} at ${appointment.timeSlot}`,
      reminderDate,
      reminderHoursBefore,
      notificationChannels: notificationChannels.map(ch => ({ channel: ch, sent: false }))
    });

    await reminder.save();
    res.status(201).json({ message: 'Appointment reminder created', reminder });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create reminder for follow-up
exports.createFollowUpReminder = async (req, res) => {
  try {
    const { ehrId, reminderHoursBefore = 48, notificationChannels = ['console'] } = req.body;

    if (!ehrId) {
      return res.status(400).json({ message: 'ehrId is required' });
    }

    // Fetch EHR
    const ehr = await EHR.findById(ehrId);
    if (!ehr || !ehr.followUpDate) {
      return res.status(404).json({ message: 'EHR or follow-up date not found' });
    }

    // Calculate reminder date
    const reminderDate = new Date(ehr.followUpDate);
    reminderDate.setHours(reminderDate.getHours() - reminderHoursBefore);

    const reminder = new Reminder({
      userId: ehr.patientId,
      patientId: ehr.patientId,
      doctorId: ehr.doctorId,
      type: 'followup',
      linkedId: ehrId,
      linkedModel: 'EHR',
      title: `Follow-up appointment reminder`,
      description: `You have a follow-up appointment scheduled for ${ehr.followUpDate.toDateString()}. Original consultation: ${ehr.diagnosis}`,
      reminderDate,
      reminderHoursBefore,
      notificationChannels: notificationChannels.map(ch => ({ channel: ch, sent: false }))
    });

    await reminder.save();
    res.status(201).json({ message: 'Follow-up reminder created', reminder });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create reminder for consultation
exports.createConsultationReminder = async (req, res) => {
  try {
    const { consultationId, reminderHoursBefore = 1, notificationChannels = ['console'] } = req.body;

    if (!consultationId) {
      return res.status(400).json({ message: 'consultationId is required' });
    }

    // Fetch consultation
    const consultation = await ConsultationSession.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    const appointment = await Appointment.findById(consultation.appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Linked appointment not found' });
    }

    // Calculate reminder date
    const reminderDate = new Date(appointment.appointmentDate);
    reminderDate.setHours(reminderDate.getHours() - reminderHoursBefore);

    const reminder = new Reminder({
      userId: consultation.patientId,
      patientId: consultation.patientId,
      doctorId: consultation.doctorId,
      type: 'consultation',
      linkedId: consultationId,
      linkedModel: 'ConsultationSession',
      title: `Upcoming consultation reminder`,
      description: `Your ${consultation.consultationType} consultation is scheduled for ${appointment.appointmentDate.toDateString()} at ${appointment.timeSlot}`,
      reminderDate,
      reminderHoursBefore,
      notificationChannels: notificationChannels.map(ch => ({ channel: ch, sent: false }))
    });

    await reminder.save();
    res.status(201).json({ message: 'Consultation reminder created', reminder });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get reminders for user
exports.getUserReminders = async (req, res) => {
  try {
    const userId = req.userId;
    const { status = 'pending' } = req.query;

    let filter = { userId };
    if (status) filter.status = status;

    const reminders = await Reminder.find(filter)
      .populate('userId', 'name email phone')
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization')
      .sort({ reminderDate: 1 });

    res.json({ reminders });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single reminder
exports.getReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;

    const reminder = await Reminder.findById(reminderId)
      .populate('userId', 'name email phone')
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization');

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ reminder });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Manually trigger reminders (admin/test endpoint)
exports.triggerReminders = async (req, res) => {
  try {
    const count = await triggerPendingReminders(Reminder, User);
    res.json({
      message: `Triggered ${count} pending reminders`,
      count
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Acknowledge reminder
exports.acknowledgeReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;

    const reminder = await Reminder.findById(reminderId);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    reminder.status = 'acknowledged';
    await reminder.save();

    res.json({ message: 'Reminder acknowledged', reminder });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Dismiss reminder
exports.dismissReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;

    const reminder = await Reminder.findById(reminderId);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    reminder.status = 'dismissed';
    await reminder.save();

    res.json({ message: 'Reminder dismissed', reminder });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update notification channels for reminder
exports.updateNotificationChannels = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { channels } = req.body;

    if (!Array.isArray(channels)) {
      return res.status(400).json({ message: 'channels must be an array' });
    }

    const reminder = await Reminder.findById(reminderId);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    reminder.notificationChannels = channels.map(ch => ({
      channel: ch,
      sent: false
    }));

    await reminder.save();
    res.json({ message: 'Notification channels updated', reminder });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get notification handlers (for frontend to know available channels)
exports.getAvailableChannels = (req, res) => {
  const channels = ['console', 'email', 'sms', 'whatsapp', 'push'];
  const descriptions = {
    console: 'Console/Mock notification (for testing)',
    email: 'Email notification (when integrated)',
    sms: 'SMS notification via Twilio (when integrated)',
    whatsapp: 'WhatsApp message via Twilio (when integrated)',
    push: 'Push notification via Firebase/OneSignal (when integrated)'
  };

  res.json({
    availableChannels: channels,
    descriptions
  });
};
