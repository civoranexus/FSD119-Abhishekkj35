/**
 * In-Memory Data Store
 * Replaces MongoDB with simple JavaScript objects and arrays
 * Data is stored in memory and will reset on server restart
 */

const bcrypt = require('bcryptjs');

// In-memory storage
const db = {
  users: [],
  appointments: [],
  consultations: [],
  ehrs: [],
  prescriptions: [],
  reminders: [],
  nextIds: {
    user: 1,
    appointment: 1,
    consultation: 1,
    ehr: 1,
    prescription: 1,
    reminder: 1,
  },
};

// Initialize with demo data
async function initializeDemo() {
  const users = [
    {
      _id: 'demo-user-1',
      name: 'Demo Patient',
      email: 'patient@demo.com',
      phone: '9000000001',
      password: await bcrypt.hash('password123', 10),
      role: 'patient',
      age: 30,
      gender: 'female',
      village: 'Demo Village',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'demo-user-2',
      name: 'Demo Doctor',
      email: 'doctor@demo.com',
      phone: '9000000002',
      password: await bcrypt.hash('password123', 10),
      role: 'doctor',
      specialization: 'General Practitioner',
      yearsOfExperience: 5,
      availabilitySlots: [{ day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true }],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'demo-user-3',
      name: 'Demo Admin',
      email: 'admin@demo.com',
      phone: '9000000003',
      password: await bcrypt.hash('password123', 10),
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  db.users = users;
  db.nextIds.user = 4;

  // Add demo appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const appointmentDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

  db.appointments = [
    {
      _id: 'apt-1',
      patientId: 'demo-user-1',
      doctorId: 'demo-user-2',
      appointmentDate,
      timeSlot: '09:00 - 09:30',
      consultationType: 'audio',
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'apt-2',
      patientId: 'demo-user-1',
      doctorId: 'demo-user-2',
      appointmentDate,
      timeSlot: '10:00 - 10:30',
      consultationType: 'audio',
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  db.nextIds.appointment = 3;

  console.log('In-memory store initialized with demo data');
}

// Helper functions
const store = {
  // Initialize
  init: initializeDemo,

  // User operations
  findUserByEmail: (email) => db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  findUserById: (id) => db.users.find((u) => u._id === id),
  createUser: (userData) => {
    const user = {
      _id: `user-${db.nextIds.user++}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.users.push(user);
    return user;
  },
  updateUser: (id, updates) => {
    const idx = db.users.findIndex((u) => u._id === id);
    if (idx === -1) return null;
    db.users[idx] = { ...db.users[idx], ...updates, updatedAt: new Date() };
    return db.users[idx];
  },
  getAllUsers: () => db.users,
  getAllDoctors: () => db.users.filter((u) => u.role === 'doctor'),

  // Appointment operations
  findAppointmentById: (id) => db.appointments.find((a) => a._id === id),
  findAppointmentsByPatientId: (patientId) =>
    db.appointments.filter((a) => a.patientId === patientId),
  findAppointmentsByDoctorId: (doctorId) =>
    db.appointments.filter((a) => a.doctorId === doctorId),
  findAppointmentsByQuery: (query) =>
    db.appointments.filter((a) => {
      if (query.patientId && a.patientId !== query.patientId) return false;
      if (query.doctorId && a.doctorId !== query.doctorId) return false;
      if (query.status && a.status !== query.status) return false;
      return true;
    }),
  createAppointment: (appointmentData) => {
    const appointment = {
      _id: `apt-${db.nextIds.appointment++}`,
      ...appointmentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.appointments.push(appointment);
    return appointment;
  },
  updateAppointment: (id, updates) => {
    const idx = db.appointments.findIndex((a) => a._id === id);
    if (idx === -1) return null;
    db.appointments[idx] = { ...db.appointments[idx], ...updates, updatedAt: new Date() };
    return db.appointments[idx];
  },
  getAllAppointments: () => db.appointments,

  // Consultation operations
  findConsultationById: (id) => db.consultations.find((c) => c._id === id),
  createConsultation: (consultationData) => {
    const consultation = {
      _id: `con-${db.nextIds.consultation++}`,
      ...consultationData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.consultations.push(consultation);
    return consultation;
  },
  updateConsultation: (id, updates) => {
    const idx = db.consultations.findIndex((c) => c._id === id);
    if (idx === -1) return null;
    db.consultations[idx] = {
      ...db.consultations[idx],
      ...updates,
      updatedAt: new Date(),
    };
    return db.consultations[idx];
  },
  getConsultationsByUserId: (userId) =>
    db.consultations.filter(
      (c) => c.patientId === userId || c.doctorId === userId
    ),

  // EHR operations
  findEHRById: (id) => db.ehrs.find((e) => e._id === id),
  createEHR: (ehrData) => {
    const ehr = {
      _id: `ehr-${db.nextIds.ehr++}`,
      ...ehrData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.ehrs.push(ehr);
    return ehr;
  },
  updateEHR: (id, updates) => {
    const idx = db.ehrs.findIndex((e) => e._id === id);
    if (idx === -1) return null;
    db.ehrs[idx] = { ...db.ehrs[idx], ...updates, updatedAt: new Date() };
    return db.ehrs[idx];
  },
  getEHRsByPatientId: (patientId) =>
    db.ehrs.filter((e) => e.patientId === patientId),

  // Prescription operations
  findPrescriptionById: (id) => db.prescriptions.find((p) => p._id === id),
  createPrescription: (prescriptionData) => {
    const prescription = {
      _id: `pres-${db.nextIds.prescription++}`,
      ...prescriptionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.prescriptions.push(prescription);
    return prescription;
  },
  updatePrescription: (id, updates) => {
    const idx = db.prescriptions.findIndex((p) => p._id === id);
    if (idx === -1) return null;
    db.prescriptions[idx] = {
      ...db.prescriptions[idx],
      ...updates,
      updatedAt: new Date(),
    };
    return db.prescriptions[idx];
  },
  getPrescriptionsByPatientId: (patientId) =>
    db.prescriptions.filter((p) => p.patientId === patientId),
  getPrescriptionsByDoctorId: (doctorId) =>
    db.prescriptions.filter((p) => p.doctorId === doctorId),

  // Reminder operations
  findReminderById: (id) => db.reminders.find((r) => r._id === id),
  createReminder: (reminderData) => {
    const reminder = {
      _id: `rem-${db.nextIds.reminder++}`,
      ...reminderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.reminders.push(reminder);
    return reminder;
  },
  updateReminder: (id, updates) => {
    const idx = db.reminders.findIndex((r) => r._id === id);
    if (idx === -1) return null;
    db.reminders[idx] = {
      ...db.reminders[idx],
      ...updates,
      updatedAt: new Date(),
    };
    return db.reminders[idx];
  },
  getRemindersByUserId: (userId) =>
    db.reminders.filter((r) => r.userId === userId),

  // Stats for admin analytics
  getUserStats: () => ({
    totalUsers: db.users.length,
    patients: db.users.filter((u) => u.role === 'patient').length,
    doctors: db.users.filter((u) => u.role === 'doctor').length,
    admins: db.users.filter((u) => u.role === 'admin').length,
  }),

  getAppointmentStats: () => {
    const stats = {
      total: db.appointments.length,
      confirmed: db.appointments.filter((a) => a.status === 'confirmed').length,
      pending: db.appointments.filter((a) => a.status === 'pending').length,
      cancelled: db.appointments.filter((a) => a.status === 'cancelled').length,
      completed: db.appointments.filter((a) => a.status === 'completed').length,
    };
    return stats;
  },

  // Debug: clear all data
  clear: () => {
    db.users = [];
    db.appointments = [];
    db.consultations = [];
    db.ehrs = [];
    db.prescriptions = [];
    db.reminders = [];
    db.nextIds = {
      user: 1,
      appointment: 1,
      consultation: 1,
      ehr: 1,
      prescription: 1,
      reminder: 1,
    };
  },

  // Debug: get all data
  getAll: () => db,
};

module.exports = store;
