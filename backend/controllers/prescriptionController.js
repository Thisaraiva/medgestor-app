const prescriptionService = require('../services/prescriptionService');

const createPrescription = async (req, res) => {
  try {
    const prescription = await prescriptionService.createPrescription(req.body, req.user);
    res.status(201).json(prescription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPrescriptionsByPatient = async (req, res) => {
  try {
    const prescriptions = await prescriptionService.getPrescriptionsByPatient(req.params.patientId);
    res.json(prescriptions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createPrescription, getPrescriptionsByPatient };