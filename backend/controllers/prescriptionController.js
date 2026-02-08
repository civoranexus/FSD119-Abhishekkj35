const EPrescription = require('../models/EPrescription');
const User = require('../models/User');
const ConsultationSession = require('../models/ConsultationSession');
const EHR = require('../models/EHR');
const crypto = require('crypto');

// Generate immutable prescription hash
const generatePrescriptionHash = (prescriptionData) => {
  const dataString = JSON.stringify(prescriptionData);
  return crypto.createHash('sha256').update(dataString).digest('hex');
};

// Doctor issues e-prescription
exports.issuePrescription = async (req, res) => {
  try {
    const doctorId = req.userId;
    const { patientId, medicines, instructions, followUpDate, consultationId, ehrId } = req.body;

    if (!patientId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: 'patientId and at least one medicine are required' });
    }

    // Validate medicine structure
    for (const med of medicines) {
      if (!med.name || !med.dosage || !med.frequency || !med.duration) {
        return res.status(400).json({ message: 'Each medicine must have name, dosage, frequency, and duration' });
      }
    }

    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can issue prescriptions' });
    }

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(400).json({ message: 'Patient not found' });
    }

    // Verify consultation exists (optional but recommended)
    if (consultationId) {
      const consultation = await ConsultationSession.findById(consultationId);
      if (!consultation || String(consultation.doctorId) !== String(doctorId)) {
        return res.status(400).json({ message: 'Invalid consultation or unauthorized doctor' });
      }
    }

    // Verify EHR exists (optional)
    if (ehrId) {
      const ehr = await EHR.findById(ehrId);
      if (!ehr || String(ehr.doctorId) !== String(doctorId)) {
        return res.status(400).json({ message: 'Invalid EHR or unauthorized doctor' });
      }
    }

    // Generate immutable hash of prescription data
    const prescriptionData = {
      patientId: String(patientId),
      doctorId: String(doctorId),
      medicines,
      instructions: instructions || '',
      issuedAt: new Date().toISOString()
    };
    const prescriptionHash = generatePrescriptionHash(prescriptionData);

    const prescription = new EPrescription({
      consultationId: consultationId || null,
      ehrId: ehrId || null,
      patientId,
      doctorId,
      medicines,
      instructions: instructions || '',
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      prescriptionHash,
      accessLog: [
        {
          userId: doctorId,
          role: 'doctor',
          action: 'issued',
          accessTime: new Date()
        }
      ]
    });

    await prescription.save();

    res.status(201).json({
      message: 'E-Prescription issued successfully',
      prescription,
      verificationHash: prescriptionHash
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get prescription by ID (role-aware access)
exports.getPrescription = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = (req.userRole || '').toLowerCase();
    const { prescriptionId } = req.params;

    const prescription = await EPrescription.findById(prescriptionId)
      .populate('patientId', 'name email role village')
      .populate('doctorId', 'name email specialization role')
      .populate('consultationId', 'sessionId status')
      .populate('ehrId', 'diagnosis');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Access control
    if (userRole === 'doctor') {
      // Doctor can view own prescriptions only
      if (String(prescription.doctorId._id) !== String(userId)) {
        return res.status(403).json({ message: 'You can only view your own prescriptions' });
      }
    } else if (userRole === 'patient') {
      // Patient can view own prescriptions only
      if (String(prescription.patientId._id) !== String(userId)) {
        return res.status(403).json({ message: 'You can only view your own prescriptions' });
      }
    } else if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Log access
    prescription.accessLog.push({
      userId,
      role: userRole,
      action: 'viewed',
      accessTime: new Date()
    });
    await prescription.save();

    res.json({ prescription });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all prescriptions for a patient (role-aware)
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = (req.userRole || '').toLowerCase();
    const { patientId } = req.params;

    // Access control
    if (userRole === 'patient' && String(userId) !== String(patientId)) {
      return res.status(403).json({ message: 'Patients can only view their own prescriptions' });
    }

    const prescriptions = await EPrescription.find({ patientId, status: 'active' })
      .populate('doctorId', 'name email specialization role')
      .sort({ issuedAt: -1 });

    res.json({ prescriptions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all prescriptions issued by doctor
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = (req.userRole || '').toLowerCase();

    if (userRole !== 'doctor' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Only doctors and admins can view doctor prescriptions' });
    }

    const doctorId = userRole === 'doctor' ? userId : req.query.doctorId;
    if (!doctorId) {
      return res.status(400).json({ message: 'doctorId is required for admin' });
    }

    const prescriptions = await EPrescription.find({ doctorId })
      .populate('patientId', 'name email role')
      .sort({ issuedAt: -1 });

    res.json({ prescriptions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Verify prescription integrity (immutability check)
exports.verifyPrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await EPrescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    const prescriptionData = {
      patientId: String(prescription.patientId),
      doctorId: String(prescription.doctorId),
      medicines: prescription.medicines,
      instructions: prescription.instructions,
      issuedAt: prescription.issuedAt.toISOString()
    };

    const recalculatedHash = generatePrescriptionHash(prescriptionData);
    const isValid = recalculatedHash === prescription.prescriptionHash;

    res.json({
      prescriptionId: prescription._id,
      isValid,
      originalHash: prescription.prescriptionHash,
      currentHash: recalculatedHash,
      message: isValid ? 'Prescription verified - data is intact' : 'Prescription integrity compromised'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Revoke prescription (doctor only)
exports.revokePrescription = async (req, res) => {
  try {
    const userId = req.userId;
    const { prescriptionId } = req.params;
    const { reason } = req.body;

    const prescription = await EPrescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Only doctor who issued can revoke
    if (String(prescription.doctorId) !== String(userId)) {
      return res.status(403).json({ message: 'Only the issuing doctor can revoke this prescription' });
    }

    if (prescription.status !== 'active') {
      return res.status(400).json({ message: 'Only active prescriptions can be revoked' });
    }

    prescription.status = 'revoked';
    prescription.pharmacyNotes = reason || 'Revoked by doctor';
    prescription.accessLog.push({
      userId,
      role: 'doctor',
      action: 'revoked',
      accessTime: new Date()
    });

    await prescription.save();

    res.json({ message: 'Prescription revoked', prescription });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark prescription as completed
exports.completePrescription = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = (req.userRole || '').toLowerCase();
    const { prescriptionId } = req.params;

    const prescription = await EPrescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Patient or doctor can mark as completed
    if (userRole === 'patient' && String(prescription.patientId) !== String(userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (userRole === 'doctor' && String(prescription.doctorId) !== String(userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (prescription.status !== 'active') {
      return res.status(400).json({ message: 'Only active prescriptions can be completed' });
    }

    prescription.status = 'completed';
    prescription.accessLog.push({
      userId,
      role: userRole,
      action: 'marked_completed',
      accessTime: new Date()
    });

    await prescription.save();

    res.json({ message: 'Prescription marked as completed', prescription });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get prescription access log (doctor/admin only)
exports.getAccessLog = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = (req.userRole || '').toLowerCase();
    const { prescriptionId } = req.params;

    const prescription = await EPrescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Only doctor (who issued) or admin can view access log
    if (userRole === 'doctor' && String(prescription.doctorId) !== String(userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (userRole !== 'doctor' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Only doctors and admins can view access logs' });
    }

    res.json({
      prescriptionId: prescription._id,
      accessLog: prescription.accessLog
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
