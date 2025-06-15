const asyncHandler = require('../middleware/controllerMiddleware');
const patientService = require('../services/patientService');
const Joi = require('joi');

const createSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).required(),
  email: Joi.string().email().allow(null),
  phone: Joi.string().allow(null),
  allergies: Joi.string().allow(null),
});

const updateSchema = Joi.object({
  name: Joi.string().min(3).max(255),
  email: Joi.string().email().allow(null),
  phone: Joi.string().allow(null),
  allergies: Joi.string().allow(null),
}).min(1);

const createPatient = asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) {
    throw new Error(error.details[0].message);
  }

  const patient = await patientService.createPatient(value);
  res.status(201).json(patient);
});

const getPatients = asyncHandler(async (req, res) => {
  const { cpf, name } = req.query;
  const patients = await patientService.getPatients({ cpf, name });
  res.json(patients);
});

const getPatientById = asyncHandler(async (req, res) => {
  const patient = await patientService.getPatientById(req.params.id);
  res.json(patient);
});

const updatePatient = asyncHandler(async (req, res) => {
  const { error, value } = updateSchema.validate(req.body);
  if (error) {
    throw new Error(error.details[0].message);
  }

  const patient = await patientService.updatePatient(req.params.id, value);
  res.json(patient);
});

const deletePatient = asyncHandler(async (req, res) => {
  await patientService.deletePatient(req.params.id);
  res.status(204).send();
});

module.exports = { createPatient, getPatients, getPatientById, updatePatient, deletePatient };