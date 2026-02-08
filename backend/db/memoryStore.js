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
      name: 'Dr. Rajesh Kumar',
      email: 'doctor1@demo.com',
      phone: '9000000002',
      password: await bcrypt.hash('password123', 10),
      role: 'doctor',
      specialization: 'General Practitioner',
      yearsOfExperience: 8,
      availabilitySlots: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Wednesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'demo-user-3',
      name: 'Dr. Priya Sharma',
      email: 'doctor2@demo.com',
      phone: '9000000003',
      password: await bcrypt.hash('password123', 10),
      role: 'doctor',
      specialization: 'Cardiologist',
      yearsOfExperience: 12,
      availabilitySlots: [
        { day: 'Monday', startTime: '10:00', endTime: '18:00', isAvailable: true },
        { day: 'Tuesday', startTime: '14:00', endTime: '20:00', isAvailable: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Thursday', startTime: '10:00', endTime: '18:00', isAvailable: true },
        { day: 'Saturday', startTime: '09:00', endTime: '13:00', isAvailable: true },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'demo-user-4',
      name: 'Dr. Amit Patel',
      email: 'doctor3@demo.com',
      phone: '9000000004',
      password: await bcrypt.hash('password123', 10),
      role: 'doctor',
      specialization: 'Pediatrician',
      yearsOfExperience: 6,
      availabilitySlots: [
        { day: 'Monday', startTime: '09:00', endTime: '13:00', isAvailable: true },
        { day: 'Tuesday', startTime: '14:00', endTime: '18:00', isAvailable: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Thursday', startTime: '10:00', endTime: '14:00', isAvailable: true },
        { day: 'Friday', startTime: '15:00', endTime: '19:00', isAvailable: true },
        { day: 'Saturday', startTime: '10:00', endTime: '14:00', isAvailable: true },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'demo-user-5',
      name: 'Dr. Sneha Desai',
      email: 'doctor4@demo.com',
      phone: '9000000005',
      password: await bcrypt.hash('password123', 10),
      role: 'doctor',
      specialization: 'Dermatologist',
      yearsOfExperience: 9,
      availabilitySlots: [
        { day: 'Monday', startTime: '11:00', endTime: '19:00', isAvailable: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Friday', startTime: '10:00', endTime: '18:00', isAvailable: true },
        { day: 'Saturday', startTime: '09:00', endTime: '15:00', isAvailable: true },
        { day: 'Sunday', startTime: '10:00', endTime: '14:00', isAvailable: true },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'demo-user-6',
      name: 'Dr. Vikram Singh',
      email: 'doctor5@demo.com',
      phone: '9000000006',
      password: await bcrypt.hash('password123', 10),
      role: 'doctor',
      specialization: 'Orthopedic Surgeon',
      yearsOfExperience: 15,
      availabilitySlots: [
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Wednesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Friday', startTime: '11:00', endTime: '19:00', isAvailable: true },
        { day: 'Saturday', startTime: '10:00', endTime: '16:00', isAvailable: true },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'demo-user-7',
      name: 'Dr. Anjali Verma',
      email: 'doctor6@demo.com',
      phone: '9000000007',
      password: await bcrypt.hash('password123', 10),
      role: 'doctor',
      specialization: 'Psychiatrist',
      yearsOfExperience: 10,
      availabilitySlots: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Tuesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
        { day: 'Thursday', startTime: '14:00', endTime: '20:00', isAvailable: true },
        { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Sunday', startTime: '11:00', endTime: '15:00', isAvailable: true },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'demo-user-8',
      name: 'Demo Admin',
      email: 'admin@demo.com',
      phone: '9000000008',
      password: await bcrypt.hash('password123', 10),
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  db.users = users;
  db.nextIds.user = 9;

  // Add demo appointments with multiple doctors
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const day2 = new Date();
  day2.setDate(day2.getDate() + 2);
  
  const day3 = new Date();
  day3.setDate(day3.getDate() + 3);

  db.appointments = [
    {
      _id: 'apt-1',
      patientId: 'demo-user-1',
      doctorId: 'demo-user-2',
      appointmentDate: tomorrow,
      timeSlot: '09:00 - 09:30',
      consultationType: 'audio',
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'apt-2',
      patientId: 'demo-user-1',
      doctorId: 'demo-user-3',
      appointmentDate: day2,
      timeSlot: '14:00 - 14:30',
      consultationType: 'video',
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'apt-3',
      patientId: 'demo-user-1',
      doctorId: 'demo-user-4',
      appointmentDate: day3,
      timeSlot: '10:00 - 10:30',
      consultationType: 'chat',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  db.nextIds.appointment = 4;

  // Add demo EHRs
  db.ehrs = [
    {
      _id: 'ehr-1',
      patientId: 'demo-user-1',
      doctorId: 'demo-user-2',
      consultationDate: new Date(),
      symptoms: 'Fever and cough',
      diagnosis: 'Viral infection',
      treatmentPlan: 'Rest, hydration, antipyretics as needed',
      prescriptions: ['Paracetamol 500mg - twice daily', 'Cough syrup - thrice daily'],
      labTests: [],
      notes: 'Patient advised home care and follow-up in 7 days. Avoid crowds.',
      followUpDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      accessLog: [
        { userId: 'demo-user-2', role: 'doctor', accessTime: new Date() }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];
  db.nextIds.ehr = 2;

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
