const express = require('express');
const router = express.Router();

const consultationController = require('../controllers/consultationController');
const authMiddleware = require('../middleware/authMiddleware');
const { isDoctor } = require('../middleware/rbac');

// Doctor initiates session from an appointment
router.post('/initiate', authMiddleware, isDoctor, consultationController.initiateSession);

// Start session (scheduled → live)
router.post('/start', authMiddleware, consultationController.startSession);

// End session (live → completed)
router.post('/end', authMiddleware, isDoctor, consultationController.endSession);

// Cancel session
router.post('/cancel', authMiddleware, consultationController.cancelSession);

// Get session details by sessionId
router.get('/:sessionId', authMiddleware, consultationController.getSession);

// Get session token (for WebRTC/simulation)
router.get('/:sessionId/token', authMiddleware, consultationController.getSessionToken);

// Get all sessions for current user (doctor/patient)
router.get('/', authMiddleware, consultationController.getUserSessions);

module.exports = router;
