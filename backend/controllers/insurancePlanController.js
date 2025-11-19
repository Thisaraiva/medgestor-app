// backend/controllers/insurancePlanController.js

const asyncHandler = require('../middleware/controllerMiddleware');
const insurancePlanService = require('../services/insurancePlanService');
const { ValidationError } = require('../errors/errors');
const Joi = require('joi');

// Schema for creating an insurance plan
const createSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    'string.min': 'Insurance plan name must be at least 3 characters long',
    'any.required': 'Insurance plan name is required',
  }),
  description: Joi.string().allow(null, '').optional(),
  isActive: Joi.boolean().optional(),
});

// Schema for updating an insurance plan (all fields are optional)
const updateSchema = Joi.object({
  name: Joi.string().min(3).optional(),
  description: Joi.string().allow(null, '').optional(),
  isActive: Joi.boolean().optional(),
}).min(1); // At least one field must be provided for update

const createInsurancePlan = asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  const plan = await insurancePlanService.createInsurancePlan(value);
  res.status(201).json(plan);
});

const getAllInsurancePlans = asyncHandler(async (req, res) => {
  const plans = await insurancePlanService.getAllInsurancePlans(); // Agora retorna todos
  res.status(200).json(plans);
});

const getAllActiveInsurancePlans = asyncHandler(async (req, res) => {
  const plans = await insurancePlanService.getActiveInsurancePlans(); // Nova função
  res.status(200).json(plans);
});

const getInsurancePlanById = asyncHandler(async (req, res) => {
  const plan = await insurancePlanService.getInsurancePlanById(req.params.id);
  res.status(200).json(plan);
});

const updateInsurancePlan = asyncHandler(async (req, res) => {
  const { error, value } = updateSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  const plan = await insurancePlanService.updateInsurancePlan(req.params.id, value);
  res.status(200).json(plan);
});

const deleteInsurancePlan = asyncHandler(async (req, res) => {
  await insurancePlanService.deleteInsurancePlan(req.params.id);
  res.status(204).send();
});

module.exports = {
  createInsurancePlan,
  getAllInsurancePlans, // Exporta a função que retorna todos
  getAllActiveInsurancePlans, // Exporta a nova função para ativos
  getInsurancePlanById,
  updateInsurancePlan,
  deleteInsurancePlan,
};