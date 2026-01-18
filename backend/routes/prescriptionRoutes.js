const express = require('express');
const router = express.Router();

const prescriptionController = require('../controllers/prescriptionController');
const authMiddleware = require('../middleware/authMiddleware');
const { isDoctor } = require('../middleware/rbac');

// Doctor issues e-prescription
router.post('/', authMiddleware, isDoctor, prescriptionController.issuePrescription);

// Get single prescription (role-aware access)
router.get('/:prescriptionId', authMiddleware, prescriptionController.getPrescription);

// Get all active prescriptions for a patient
router.get('/patient/:patientId', authMiddleware, prescriptionController.getPatientPrescriptions);

// Get all prescriptions issued by doctor
router.get('/doctor/issued', authMiddleware, prescriptionController.getDoctorPrescriptions);

// Verify prescription integrity (public, no auth needed for verification)
router.post('/:prescriptionId/verify', prescriptionController.verifyPrescription);

// Revoke prescription (doctor only)
router.patch('/:prescriptionId/revoke', authMiddleware, isDoctor, prescriptionController.revokePrescription);

// Mark prescription as completed
router.patch('/:prescriptionId/complete', authMiddleware, prescriptionController.completePrescription);

// Get access log (doctor/admin only)
router.get('/:prescriptionId/access-log', authMiddleware, prescriptionController.getAccessLog);

module.exports = router;
