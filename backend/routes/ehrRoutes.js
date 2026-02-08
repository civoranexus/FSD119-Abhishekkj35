const express = require('express');
const router = express.Router();

const ehrController = require('../controllers/ehrController');
const authMiddleware = require('../middleware/authMiddleware');
const { isDoctor, isAdmin } = require('../middleware/rbac');

// Create EHR (doctor only)
router.post('/', authMiddleware, isDoctor, ehrController.createEHR);

// Get single EHR by ID (role-aware access)
router.get('/:ehrId', authMiddleware, ehrController.getEHRById);

// Get all EHRs for a patient
router.get('/patient/:patientId', authMiddleware, ehrController.getPatientEHRs);

// Update EHR (doctor only)
router.patch('/:ehrId', authMiddleware, isDoctor, ehrController.updateEHR);

// Get access log (doctor/admin only)
router.get('/:ehrId/access-log', authMiddleware, ehrController.getAccessLog);

module.exports = router;
