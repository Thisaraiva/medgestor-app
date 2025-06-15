const asyncHandler = require('../middleware/controllerMiddleware');
const authService = require('../services/authService');
const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'doctor', 'secretary').required(),
  crm: Joi.string().pattern(/^CRM\/[A-Z]{2}-\d{1,6}$/).when('role', {
    is: 'doctor',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const register = asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw new Error(error.details[0].message);
  }

  const result = await authService.register(value);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw new Error(error.details[0].message);
  }

  const result = await authService.login(value);
  res.json(result);
});

module.exports = { register, login };