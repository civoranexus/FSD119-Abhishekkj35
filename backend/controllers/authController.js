const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
exports.register = async (req, res) => {
  try {
      const { name, email, password, phone, role, age, gender, village, specialization, yearsOfExperience, availabilitySlots } = req.body;

      // Validate common fields
      if (!name || !email || !password || !phone) {
          return res.status(400).json({ message: 'name, email, password, and phone are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

      const userRole = role || 'patient';

      // Validate role-specific fields
      if (userRole === 'patient') {
          if (!age || !gender || !village) {
              return res.status(400).json({ message: 'Patient registration requires: age, gender, village' });
          }
      }

      if (userRole === 'doctor') {
          if (!specialization || yearsOfExperience === undefined) {
              return res.status(400).json({ message: 'Doctor registration requires: specialization, yearsOfExperience' });
          }
      }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with role-specific fields
      const userData = {
      name,
      email,
      password: hashedPassword,
          phone,
          role: userRole
      };

      if (userRole === 'patient') {
          userData.age = age;
          userData.gender = gender;
          userData.village = village;
      }

      if (userRole === 'doctor') {
          userData.specialization = specialization;
          userData.yearsOfExperience = yearsOfExperience;
          userData.availabilitySlots = availabilitySlots || [];
      }

      const user = new User(userData);
    await user.save();

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret_key', {
      expiresIn: '7d'
    });

      const responseUser = user.toObject();
      delete responseUser.password;

      res.status(201).json({
          message: 'User registered successfully',
          token,
          user: responseUser
      });
  } catch (error) {
      // Handle MongoDB validation errors
      if (error.name === 'ValidationError') {
          const messages = Object.values(error.errors).map(err => err.message);
          return res.status(400).json({ message: 'Validation error', errors: messages });
      }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret_key', {
      expiresIn: '7d'
    });

    res.json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
