const express = require('express');
const router = express.Router();

const reminderController = require('../controllers/reminderController');
const authMiddleware = require('../middleware/authMiddleware');

// Create appointment reminder
router.post('/appointment', authMiddleware, reminderController.createAppointmentReminder);

// Create follow-up reminder
router.post('/followup', authMiddleware, reminderController.createFollowUpReminder);

// Create consultation reminder
router.post('/consultation', authMiddleware, reminderController.createConsultationReminder);

// Get all reminders for user
router.get('/', authMiddleware, reminderController.getUserReminders);

// Get single reminder
router.get('/:reminderId', authMiddleware, reminderController.getReminder);

// Acknowledge reminder
router.patch('/:reminderId/acknowledge', authMiddleware, reminderController.acknowledgeReminder);

// Dismiss reminder
router.patch('/:reminderId/dismiss', authMiddleware, reminderController.dismissReminder);

// Update notification channels
router.patch('/:reminderId/channels', authMiddleware, reminderController.updateNotificationChannels);

// Trigger pending reminders (admin/test endpoint)
router.post('/trigger/all', authMiddleware, reminderController.triggerReminders);

// Get available notification channels (public)
router.get('/channels/available', reminderController.getAvailableChannels);

module.exports = router;
