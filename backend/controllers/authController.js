const asyncHandler = require('../middleware/controllerMiddleware');
const authService = require('../services/authService');
const { ValidationError } = require('../errors/errors');
const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    'string.min': 'Nome deve ter pelo menos 3 caracteres',
    'any.required': 'Nome é obrigatório',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ser válido',
    'any.required': 'Email é obrigatório',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'any.required': 'Senha é obrigatória',
  }),
  role: Joi.string().valid('admin', 'doctor', 'secretary').required().messages({
    'any.only': 'Role deve ser admin, doctor ou secretary',
    'any.required': 'Role é obrigatório',
  }),
  crm: Joi.string().pattern(/^CRM\/[A-Z]{2}-\d{1,6}$/).allow(null).messages({
    'string.pattern.base': 'CRM deve estar no formato CRM/UF-XXXXXX',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ser válido',
    'any.required': 'Email é obrigatório',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Senha é obrigatória',
  }),
});

const register = asyncHandler(async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  if (req.user.role !== 'admin') {
    throw new ValidationError('Acesso negado: permissão insuficiente', 403);
  }
  const userData = await authService.register(req.body);
  res.status(201).json(userData);
});

const login = asyncHandler(async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  const userData = await authService.login(req.body);
  res.status(200).json(userData);
});

module.exports = { register, login };