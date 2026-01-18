const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/rbac');

// All analytics endpoints require admin authentication

// User statistics
router.get('/users', authMiddleware, isAdmin, analyticsController.getUserStats);

// Consultation statistics
router.get('/consultations', authMiddleware, isAdmin, analyticsController.getConsultationStats);

// Doctor utilization statistics
router.get('/doctors/utilization', authMiddleware, isAdmin, analyticsController.getDoctorUtilization);

// Appointment analytics
router.get('/appointments', authMiddleware, isAdmin, analyticsController.getAppointmentAnalytics);

// EHR statistics
router.get('/ehr', authMiddleware, isAdmin, analyticsController.getEHRStats);

// Prescription statistics
router.get('/prescriptions', authMiddleware, isAdmin, analyticsController.getPrescriptionStats);

// Reminder/notification statistics
router.get('/reminders', authMiddleware, isAdmin, analyticsController.getReminderStats);

// Complete system overview
router.get('/overview', authMiddleware, isAdmin, analyticsController.getSystemOverview);

// System-wide audit log
router.get('/audit-log', authMiddleware, isAdmin, analyticsController.getAuditLog);

module.exports = router;
