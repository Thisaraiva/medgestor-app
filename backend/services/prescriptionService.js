const { Prescription, Patient, User } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');
const Joi = require('joi');

const prescriptionSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  medication: Joi.string().required(),
  dosage: Joi.string().allow(null, ''),
  frequency: Joi.string().allow(null, ''),
  duration: Joi.string().allow(null, ''),
  administrationInstructions: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, ''),
  dateIssued: Joi.date().iso().required(),
  status: Joi.string().valid('active', 'inactive').optional(),
});

const createPrescription = async (data, doctorId) => {
  const { error } = prescriptionSchema.validate({ ...data, doctorId });
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const patient = await Patient.findByPk(data.patientId);
  const doctor = await User.findByPk(doctorId);
  if (!patient) {
    throw new NotFoundError('Paciente não encontrado');
  }
  if (!doctor || doctor.role !== 'doctor') {
    throw new NotFoundError('Médico não encontrado');
  }

  return Prescription.create({ ...data, doctorId });
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

  if (!prescriptions.length && !(await Patient.findByPk(patientId))) {
    throw new NotFoundError('Paciente não encontrado');
  }
  return prescriptions;
};

const updatePrescription = async (id, data, doctorId) => {
  const prescription = await Prescription.findByPk(id);
  if (!prescription) {
    throw new NotFoundError('Prescrição não encontrada');
  }

  const updateData = { ...data, doctorId };
  const { error } = prescriptionSchema.validate(updateData);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const patient = await Patient.findByPk(data.patientId || prescription.patientId);
  if (!patient) {
    throw new NotFoundError('Paciente não encontrado');
  }

  return prescription.update(updateData);
};

module.exports = { createPrescription, getPrescriptionsByPatient, updatePrescription };