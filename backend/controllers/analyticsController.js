const User = require('../models/User');
const Appointment = require('../models/Appointment');
const ConsultationSession = require('../models/ConsultationSession');
const EHR = require('../models/EHR');
const EPrescription = require('../models/EPrescription');
const Reminder = require('../models/Reminder');

/**
 * Admin Analytics & Reporting Controller
 * All endpoints require admin role
 */

// Get user statistics by role
exports.getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const totalUsers = stats.reduce((sum, s) => sum + s.count, 0);

    // Get newly registered users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      totalUsers,
      usersByRole: stats,
      newUsersLast7Days: newUsers,
      breakdown: {
        patients: stats.find(s => s._id === 'patient')?.count || 0,
        doctors: stats.find(s => s._id === 'doctor')?.count || 0,
        admins: stats.find(s => s._id === 'admin')?.count || 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get consultation statistics
exports.getConsultationStats = async (req, res) => {
  try {
    const stats = await ConsultationSession.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    const totalConsultations = stats.reduce((sum, s) => sum + s.count, 0);

    // By consultation type
    const byType = await ConsultationSession.aggregate([
      {
        $group: {
          _id: '$consultationType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Consultations this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const thisMonth = await ConsultationSession.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    res.json({
      totalConsultations,
      byStatus: stats,
      byType: byType,
      thisMonth,
      avgDuration: stats.find(s => s._id === 'completed')?.avgDuration || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get doctor utilization statistics
exports.getDoctorUtilization = async (req, res) => {
  try {
    // Total doctors
    const totalDoctors = await User.countDocuments({ role: 'doctor' });

    // Doctors with consultations
    const doctorsWithConsultations = await ConsultationSession.distinct('doctorId');
    const activeDoctors = doctorsWithConsultations.length;

    // Consultations per doctor
    const consultationsPerDoctor = await ConsultationSession.aggregate([
      {
        $group: {
          _id: '$doctorId',
          consultationCount: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctorInfo'
        }
      },
      {
        $unwind: '$doctorInfo'
      },
      {
        $project: {
          _id: 1,
          doctorName: '$doctorInfo.name',
          specialization: '$doctorInfo.specialization',
          consultationCount: 1,
          avgDuration: 1,
          completedCount: 1,
          utilization: {
            $divide: ['$completedCount', '$consultationCount']
          }
        }
      },
      {
        $sort: { consultationCount: -1 }
      }
    ]);

    const topDoctors = consultationsPerDoctor.slice(0, 5);
    const avgConsultationsPerDoctor =
      consultationsPerDoctor.reduce((sum, d) => sum + d.consultationCount, 0) / (activeDoctors || 1);

    res.json({
      totalDoctors,
      activeDoctors,
      avgConsultationsPerDoctor,
      consultationsPerDoctor,
      topDoctors
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get appointment analytics
exports.getAppointmentAnalytics = async (req, res) => {
  try {
    // Total appointments
    const totalAppointments = await Appointment.countDocuments();

    // By status
    const byStatus = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // By consultation type
    const byConsultationType = await Appointment.aggregate([
      {
        $group: {
          _id: '$consultationType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Appointments this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeek = await Appointment.countDocuments({
      appointmentDate: { $gte: startOfWeek }
    });

    // Confirmed vs pending
    const confirmed = byStatus.find(s => s._id === 'confirmed')?.count || 0;
    const pending = byStatus.find(s => s._id === 'pending')?.count || 0;
    const completed = byStatus.find(s => s._id === 'completed')?.count || 0;
    const cancelled = byStatus.find(s => s._id === 'cancelled')?.count || 0;

    // Upcoming appointments (next 7 days)
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const upcoming = await Appointment.countDocuments({
      appointmentDate: { $gte: now, $lte: sevenDaysLater },
      status: { $ne: 'cancelled' }
    });

    res.json({
      totalAppointments,
      byStatus,
      byConsultationType,
      thisWeek,
      upcoming,
      breakdown: {
        confirmed,
        pending,
        completed,
        cancelled
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get EHR statistics
exports.getEHRStats = async (req, res) => {
  try {
    const totalEHRs = await EHR.countDocuments();

    // EHRs by doctor
    const byDoctor = await EHR.aggregate([
      {
        $group: {
          _id: '$doctorId',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // EHRs by patient
    const uniquePatients = await EHR.distinct('patientId');

    // Average access logs per EHR (audit trail activity)
    const avgAccessLogs = await EHR.aggregate([
      {
        $group: {
          _id: null,
          avgAccess: { $avg: { $size: '$accessLog' } }
        }
      }
    ]);

    // This month's EHRs
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const thisMonth = await EHR.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    res.json({
      totalEHRs,
      uniquePatients: uniquePatients.length,
      ehrsPerDoctor: byDoctor.slice(0, 10),
      avgAccessLogsPerEHR: avgAccessLogs[0]?.avgAccess || 0,
      thisMonth
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get prescription statistics
exports.getPrescriptionStats = async (req, res) => {
  try {
    const totalPrescriptions = await EPrescription.countDocuments();

    // By status
    const byStatus = await EPrescription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Prescriptions issued this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const thisMonth = await EPrescription.countDocuments({
      issuedAt: { $gte: startOfMonth }
    });

    // Most prescribed medicines
    const topMedicines = await EPrescription.aggregate([
      { $unwind: '$medicines' },
      {
        $group: {
          _id: '$medicines.name',
          prescriptionCount: { $sum: 1 }
        }
      },
      { $sort: { prescriptionCount: -1 } },
      { $limit: 10 }
    ]);

    // Active prescriptions
    const active = byStatus.find(s => s._id === 'active')?.count || 0;
    const completed = byStatus.find(s => s._id === 'completed')?.count || 0;
    const revoked = byStatus.find(s => s._id === 'revoked')?.count || 0;

    res.json({
      totalPrescriptions,
      byStatus,
      thisMonth,
      topMedicines,
      breakdown: {
        active,
        completed,
        revoked
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get reminder/notification statistics
exports.getReminderStats = async (req, res) => {
  try {
    const totalReminders = await Reminder.countDocuments();

    // By status
    const byStatus = await Reminder.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // By type
    const byType = await Reminder.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Notification channels usage
    const channelUsage = await Reminder.aggregate([
      { $unwind: '$notificationChannels' },
      {
        $group: {
          _id: '$notificationChannels.channel',
          count: { $sum: 1 },
          sentCount: {
            $sum: {
              $cond: ['$notificationChannels.sent', 1, 0]
            }
          }
        }
      }
    ]);

    res.json({
      totalReminders,
      byStatus,
      byType,
      channelUsage
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get complete system overview
exports.getSystemOverview = async (req, res) => {
  try {
    // User stats
    const userStats = await User.countDocuments();
    const patients = await User.countDocuments({ role: 'patient' });
    const doctors = await User.countDocuments({ role: 'doctor' });
    const admins = await User.countDocuments({ role: 'admin' });

    // Appointment stats
    const appointments = await Appointment.countDocuments();
    const appointmentsConfirmed = await Appointment.countDocuments({ status: 'confirmed' });
    const appointmentsPending = await Appointment.countDocuments({ status: 'pending' });

    // Consultation stats
    const consultations = await ConsultationSession.countDocuments();
    const consultationsLive = await ConsultationSession.countDocuments({ status: 'live' });
    const consultationsCompleted = await ConsultationSession.countDocuments({ status: 'completed' });

    // EHR stats
    const ehrs = await EHR.countDocuments();

    // Prescription stats
    const prescriptions = await EPrescription.countDocuments();
    const prescriptionsActive = await EPrescription.countDocuments({ status: 'active' });

    // This month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    const appointmentsThisMonth = await Appointment.countDocuments({ createdAt: { $gte: startOfMonth } });
    const consultationsThisMonth = await ConsultationSession.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    res.json({
      summary: {
        totalUsers: userStats,
        totalAppointments: appointments,
        totalConsultations: consultations,
        totalEHRs: ehrs,
        totalPrescriptions: prescriptions
      },
      users: {
        patients,
        doctors,
        admins,
        newThisMonth: newUsersThisMonth
      },
      appointments: {
        total: appointments,
        confirmed: appointmentsConfirmed,
        pending: appointmentsPending,
        thisMonth: appointmentsThisMonth
      },
      consultations: {
        total: consultations,
        live: consultationsLive,
        completed: consultationsCompleted,
        thisMonth: consultationsThisMonth
      },
      prescriptions: {
        total: prescriptions,
        active: prescriptionsActive
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get audit log (system-wide activity)
exports.getAuditLog = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Collect access logs from EHRs
    const ehrAccessLogs = await EHR.aggregate([
      { $unwind: '$accessLog' },
      {
        $project: {
          userId: '$accessLog.userId',
          action: { $literal: 'EHR_ACCESSED' },
          resource: '$_id',
          timestamp: '$accessLog.accessTime'
        }
      },
      { $sort: { timestamp: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    // Collect from prescriptions
    const prescriptionAccessLogs = await EPrescription.aggregate([
      { $unwind: '$accessLog' },
      {
        $project: {
          userId: '$accessLog.userId',
          action: '$accessLog.action',
          resource: '$_id',
          timestamp: '$accessLog.accessTime'
        }
      },
      { $sort: { timestamp: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    // Combine and sort
    const logs = [...ehrAccessLogs, ...prescriptionAccessLogs]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    res.json({
      auditLog: logs,
      page,
      limit,
      message: 'System-wide audit log (recent activity)'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
