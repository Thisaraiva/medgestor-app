// backend/services/prescriptionService.js

const { Prescription } = require('../models');
const { NotFoundError } = require('../errors/errors');

const createPrescription = async (data) => {
  return Prescription.create(data);
};

const getPrescriptionsByPatient = async (patientId) => {
  const prescriptions = await Prescription.findAll({ where: { patientId } });
  return prescriptions;
};

const getPrescriptionById = async (id) => {
  const prescription = await Prescription.findByPk(id);
  if (!prescription) {
    throw new NotFoundError('Prescrição não encontrada');
  }
  return prescription;
};

const updatePrescription = async (id, data) => {
  const prescription = await Prescription.findByPk(id);
  if (!prescription) {
    throw new NotFoundError('Prescrição não encontrada');
  }
  return prescription.update(data);
};

const deletePrescription = async (id) => {
  const prescription = await Prescription.findByPk(id);
  if (!prescription) {
    throw new NotFoundError('Prescrição não encontrada');
  }
  await prescription.destroy();
};

module.exports = {
  createPrescription,
  getPrescriptionsByPatient,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
};