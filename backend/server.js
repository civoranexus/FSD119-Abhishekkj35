const express = require('express');
const cors = require('cors');
require('dotenv').config();

const store = require('./db/memoryStore');

const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const authMiddleware = require('./middleware/authMiddleware');
// const consultationRoutes = require('./routes/consultationRoutes');
// const ehrRoutes = require('./routes/ehrRoutes');
// const prescriptionRoutes = require('./routes/prescriptionRoutes');
// const reminderRoutes = require('./routes/reminderRoutes');
// const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize in-memory store with demo data
store.init().catch(err => {
  console.error('Failed to initialize in-memory store:', err);
  process.exit(1);
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'HealthVillage Telemedicine API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// Minimal EHR endpoint (reads from in-memory store). This provides the frontend with patient EHRs while full controller
// conversion is in progress. Returns { ehrs: [...] } for the authenticated user.
app.get('/api/ehr', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    const ehrs = store.getEHRsByPatientId(userId) || [];
    // For safety, remove any sensitive fields before returning
    const safe = ehrs.map((e) => ({
      _id: e._id,
      patientId: e.patientId,
      doctorId: e.doctorId,
      consultationDate: e.consultationDate,
      symptoms: e.symptoms,
      diagnosis: e.diagnosis,
      treatmentPlan: e.treatmentPlan,
      prescriptions: e.prescriptions || [],
      followUpDate: e.followUpDate || null,
      notes: e.notes || null,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));
    return res.json({ ehrs: safe });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// app.use('/api/consultations', consultationRoutes);
// app.use('/api/ehr', ehrRoutes);
// app.use('/api/prescriptions', prescriptionRoutes);
// app.use('/api/reminders', reminderRoutes);
// app.use('/api/analytics', analyticsRoutes);

// Start Server with error handling and graceful shutdown
const PORT = parseInt(process.env.PORT, 10) || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (pid=${process.pid})`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Another process is listening on this port.`);
    console.error('To free the port, run:');
    console.error(`  # Windows PowerShell\n  (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess | Sort-Object -Unique\n  taskkill /PID <PID> /F`);
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down server (pid=${process.pid})...`);
  server.close(() => {
    console.log('Server closed. Exiting.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
