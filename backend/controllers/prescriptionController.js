// backend/controllers/prescriptionController.js

const asyncHandler = require('../middleware/controllerMiddleware');
const prescriptionService = require('../services/prescriptionService');
const { ValidationError } = require('../errors/errors');
const Joi = require('joi');

// Schema para criação de prescrição, incluindo doctorId
const createPrescriptionSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  doctorId: Joi.string().uuid().required(), // Adiciona o campo doctorId obrigatório
  medication: Joi.string().min(3).required(),
  dosage: Joi.string().allow(null, ''),
  frequency: Joi.string().allow(null, ''),
  duration: Joi.string().allow(null, ''),
  administrationInstructions: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, ''),
  dateIssued: Joi.date().iso().required(),
  status: Joi.string().valid('active', 'inactive', 'expired').default('active'),
});

// Schema para atualização de prescrição
const updatePrescriptionSchema = Joi.object({
  medication: Joi.string().min(3),
  dosage: Joi.string().allow(null, ''),
  frequency: Joi.string().allow(null, ''),
  duration: Joi.string().allow(null, ''),
  administrationInstructions: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, ''),
  dateIssued: Joi.date().iso(),
  status: Joi.string().valid('active', 'inactive', 'expired'),
}).min(1).required().messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização.',
});

exports.createPrescription = asyncHandler(async (req, res) => {
  const { error, value } = createPrescriptionSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  const newPrescription = await prescriptionService.createPrescription(value);
  res.status(201).json(newPrescription);
});

exports.getPrescriptionsByPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const prescriptions = await prescriptionService.getPrescriptionsByPatient(patientId);
  res.status(200).json(prescriptions);
});

exports.getPrescriptionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const prescription = await prescriptionService.getPrescriptionById(id);
  res.status(200).json(prescription);
});

exports.updatePrescription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error, value } = updatePrescriptionSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details.map(x => x.message).join(', '));
  }
  const updatedPrescription = await prescriptionService.updatePrescription(id, value);
  res.status(200).json({ message: 'Prescrição atualizada com sucesso!', prescription: updatedPrescription });
});

exports.deletePrescription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prescriptionService.deletePrescription(id);
  res.status(200).json({ message: 'Prescrição excluída com sucesso!' });
});