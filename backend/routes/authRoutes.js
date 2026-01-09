const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { isPatient, isDoctor, isAdmin } = require('../middleware/rbac');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getCurrentUser);

// Example role-protected routes (use after authentication)
router.get('/patient-only', authMiddleware, isPatient, (req, res) => {
	res.json({ message: 'Hello Patient — access granted' });
});

router.get('/doctor-only', authMiddleware, isDoctor, (req, res) => {
	res.json({ message: 'Hello Doctor — access granted' });
});

router.get('/admin-only', authMiddleware, isAdmin, (req, res) => {
	res.json({ message: 'Hello Admin — access granted' });
});

module.exports = router;
