const asyncHandler = require('../middleware/controllerMiddleware');
const prescriptionService = require('../services/prescriptionService');
const { ValidationError } = require('../errors/errors');
const Joi = require('joi');

const createSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  medication: Joi.string().min(1).required(),
  dosage: Joi.string().allow(null, ''),
  frequency: Joi.string().allow(null, ''),
  duration: Joi.string().allow(null, ''),
  administrationInstructions: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, ''),
  dateIssued: Joi.date().iso().required(),
  status: Joi.string().valid('active', 'inactive').optional(),
});

const createPrescription = asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const prescription = await prescriptionService.createPrescription(value, req.user.id);
  res.status(201).json(prescription);
});

const getPrescriptionsByPatient = asyncHandler(async (req, res) => {
  const { status, dateIssued } = req.query;
  const prescriptions = await prescriptionService.getPrescriptionsByPatient(req.params.patientId, { status, dateIssued });
  res.status(200).json(prescriptions);
});

const updatePrescription = asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const prescription = await prescriptionService.updatePrescription(req.params.id, value, req.user.id);
  res.status(200).json(prescription);
});

module.exports = { createPrescription, getPrescriptionsByPatient, updatePrescription };