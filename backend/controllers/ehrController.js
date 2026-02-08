const EHR = require('../models/EHR');
const User = require('../models/User');
const { encryptData, decryptData } = require('../utils/encryption');

// Doctor creates EHR for patient after consultation
exports.createEHR = async (req, res) => {
  try {
    const doctorId = req.userId;
    const { patientId, consultationDate, symptoms, diagnosis, treatmentPlan, prescriptions, labTests, notes, followUpDate } = req.body;

    if (!patientId || !consultationDate || !symptoms || !diagnosis || !treatmentPlan) {
      return res.status(400).json({ message: 'patientId, consultationDate, symptoms, diagnosis, treatmentPlan are required' });
    }

    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can create EHR' });
    }

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(400).json({ message: 'Patient not found' });
    }

    // Encrypt sensitive data
    const medicalDataObject = {
      symptoms,
      prescriptions: prescriptions || [],
      labTests: labTests || []
    };

    const encryptedMedicalData = encryptData(JSON.stringify(medicalDataObject));
    const encryptedNotes = notes ? encryptData(notes) : null;

    const ehr = new EHR({
      patientId,
      doctorId,
      consultationDate: new Date(consultationDate),
      symptoms,
      diagnosis,
      treatmentPlan,
      encryptedMedicalData,
      encryptedNotes,
      prescriptions: prescriptions || [],
      labTests: labTests || [],
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      accessLog: [
        {
          userId: doctorId,
          role: 'doctor',
          accessTime: new Date()
        }
      ]
    });

    await ehr.save();
    
    // Return unencrypted version to doctor
    res.status(201).json({
      message: 'EHR created successfully',
      ehr: {
        ...ehr.toObject(),
        notes: notes || null
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get EHR by ID (role-aware access control)
exports.getEHRById = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = (req.userRole || '').toLowerCase();
    const { ehrId } = req.params;

    const ehr = await EHR.findById(ehrId)
      .populate('patientId', 'name email role village')
      .populate('doctorId', 'name email specialization role');

    if (!ehr) {
      return res.status(404).json({ message: 'EHR not found' });
    }

    // Access control
    if (userRole === 'doctor') {
      // Doctor can view own EHRs only
      if (String(ehr.doctorId._id) !== String(userId)) {
        return res.status(403).json({ message: 'You can only view your own EHRs' });
      }
    } else if (userRole === 'patient') {
      // Patient can view own EHRs only
      if (String(ehr.patientId._id) !== String(userId)) {
        return res.status(403).json({ message: 'You can only view your own EHRs' });
      }
    } else if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Decrypt sensitive data for authorized users
    let decryptedData = null;
    let decryptedNotes = null;

    try {
      if (ehr.encryptedMedicalData) {
        decryptedData = JSON.parse(decryptData(ehr.encryptedMedicalData));
      }
      if (ehr.encryptedNotes && (userRole === 'doctor' || userRole === 'admin')) {
        decryptedNotes = decryptData(ehr.encryptedNotes);
      }
    } catch (decryptErr) {
      console.error('Decryption error:', decryptErr.message);
    }

    // Log access
    ehr.accessLog.push({
      userId,
      role: userRole,
      accessTime: new Date()
    });
    await ehr.save();

    res.json({
      ehr: {
        ...ehr.toObject(),
        encryptedMedicalData: undefined, // Don't expose encrypted data
        encryptedNotes: undefined,
        decryptedMedicalData: decryptedData,
        decryptedNotes: decryptedNotes || (userRole === 'patient' ? 'Access Denied' : null)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get EHRs for a patient (doctor/patient/admin only)
exports.getPatientEHRs = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = (req.userRole || '').toLowerCase();
    const { patientId } = req.params;

    // Access control
    if (userRole === 'patient' && String(userId) !== String(patientId)) {
      return res.status(403).json({ message: 'Patients can only view their own EHRs' });
    }

    if (userRole === 'doctor') {
      // Doctor can view their own EHRs with this patient
      const ehr = await EHR.find({ patientId, doctorId: userId });
      return res.json({ ehrs: ehr });
    }

    // Admin or patient viewing own
    const ehrs = await EHR.find({ patientId })
      .populate('patientId', 'name email role')
      .populate('doctorId', 'name email specialization role')
      .sort({ consultationDate: -1 });

    res.json({ ehrs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update EHR (doctor only)
exports.updateEHR = async (req, res) => {
  try {
    const userId = req.userId;
    const { ehrId } = req.params;
    const { diagnosis, treatmentPlan, notes, followUpDate, prescriptions, labTests } = req.body;

    const ehr = await EHR.findById(ehrId);
    if (!ehr) {
      return res.status(404).json({ message: 'EHR not found' });
    }

    // Only the doctor who created the EHR can update it
    if (String(ehr.doctorId) !== String(userId)) {
      return res.status(403).json({ message: 'Only the doctor who created this EHR can update it' });
    }

    // Update fields
    if (diagnosis) ehr.diagnosis = diagnosis;
    if (treatmentPlan) ehr.treatmentPlan = treatmentPlan;
    if (prescriptions) ehr.prescriptions = prescriptions;
    if (labTests) ehr.labTests = labTests;
    if (followUpDate) ehr.followUpDate = new Date(followUpDate);
    if (notes) ehr.encryptedNotes = encryptData(notes);

    await ehr.save();

    res.json({
      message: 'EHR updated successfully',
      ehr: {
        ...ehr.toObject(),
        encryptedMedicalData: undefined,
        encryptedNotes: undefined
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get access log for EHR (doctor/admin only)
exports.getAccessLog = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = (req.userRole || '').toLowerCase();
    const { ehrId } = req.params;

    const ehr = await EHR.findById(ehrId);
    if (!ehr) {
      return res.status(404).json({ message: 'EHR not found' });
    }

    // Only doctor (who created) or admin can view access log
    if (userRole === 'doctor' && String(ehr.doctorId) !== String(userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (userRole !== 'doctor' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Only doctors and admins can view access logs' });
    }

    res.json({
      ehrId: ehr._id,
      accessLog: ehr.accessLog
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
