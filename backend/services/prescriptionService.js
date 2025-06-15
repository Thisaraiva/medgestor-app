const { Prescription, Patient, User } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');

const validatePrescription = ({ patientId, doctorId, medication, dateIssued }) => {
  if (!patientId || !doctorId) {
    throw new ValidationError('patientId e doctorId são obrigatórios');
  }
  if (!medication) {
    throw new ValidationError('Medicamento é obrigatório');
  }
  if (!dateIssued || new Date(dateIssued) > new Date()) {
    throw new ValidationError('Data de emissão deve ser válida e não futura');
  }
};

const createPrescription = async ({ patientId, doctorId, medication, dosage, frequency, duration, administrationInstructions, notes, dateIssued }) => {
  validatePrescription({ patientId, doctorId, medication, dateIssued });
  const patient = await Patient.findByPk(patientId);
  const doctor = await User.findByPk(doctorId);
  if (!patient || !doctor) {
    throw new NotFoundError('Paciente ou médico não encontrado');
  }
  return Prescription.create({
    patientId,
    doctorId,
    medication,
    dosage,
    frequency,
    duration,
    administrationInstructions,
    notes,
    dateIssued,
  });
};

const getPrescriptionsByPatient = async (patientId, { status, dateIssued }) => {
  const where = { patientId };
  if (status) {
    where.status = status;
  }
  if (dateIssued) {
    where.dateIssued = dateIssued;
  }
  const prescriptions = await Prescription.findAll({
    where,
    include: [
      { model: Patient, attributes: ['id', 'name'] },
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
    ],
  });
  if (!prescriptions.length && !await Patient.findByPk(patientId)) {
    throw new NotFoundError('Paciente não encontrado');
  }
  return prescriptions;
};

module.exports = { createPrescription, getPrescriptionsByPatient };