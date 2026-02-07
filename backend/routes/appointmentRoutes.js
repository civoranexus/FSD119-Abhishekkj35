const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');
const { isPatient, isDoctor, isAdmin } = require('../middleware/rbac');

// Get all available doctors (must be before /:id routes)
router.get('/doctors/available', appointmentController.getAvailableDoctors);

// Patient books
router.post('/', authMiddleware, isPatient, appointmentController.createAppointment);

// Get appointments (admin/doctor/patient) - behavior controlled in controller
router.get('/', authMiddleware, appointmentController.getAppointments);

// Doctor updates status for their appointment
router.patch('/:id/status', authMiddleware, isDoctor, appointmentController.updateStatus);

// Doctor sets availability
router.patch('/availability', authMiddleware, isDoctor, appointmentController.setAvailability);

// Admin can update any status
router.patch('/:id/status/admin', authMiddleware, isAdmin, appointmentController.adminUpdateStatus);

module.exports = router;
