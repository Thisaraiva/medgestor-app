const asyncHandler = require('../middleware/controllerMiddleware');
const appointmentService = require('../services/appointmentService');
const { ValidationError } = require('../errors/errors');
//const { sendAppointmentConfirmation } = require('../utils/email');
const Joi = require('joi');

const createSchema = Joi.object({
  doctorId: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do médico deve ser um UUID válido',
    'any.required': 'ID do médico é obrigatório',
  }),
  patientId: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do paciente deve ser um UUID válido',
    'any.required': 'ID do paciente é obrigatório',
  }),
  date: Joi.string().pattern(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/).required().messages({
    'string.pattern.base': 'Data deve estar no formato dd/MM/yyyy HH:mm',
    'any.required': 'Data é obrigatória',
  }),
  type: Joi.string().valid('initial', 'return').required().messages({
    'any.only': 'Tipo deve ser "initial" ou "return"',
    'any.required': 'Tipo é obrigatório',
  }),
  insurance: Joi.boolean().allow(null).messages({
    'boolean.base': 'Seguro deve ser um valor booleano',
  }),
});

const getSchema = Joi.object({
  status: Joi.string().optional(),
  type: Joi.string().valid('initial', 'return').optional(),
  doctorId: Joi.string().uuid().optional().messages({
    'string.uuid': 'ID do médico deve ser um UUID válido',
  }),
  patientId: Joi.string().uuid().optional().messages({
    'string.uuid': 'ID do paciente deve ser um UUID válido',
  }),
});

const createAppointment = asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  if (req.user.role !== 'doctor' && req.user.role !== 'secretary') {
    throw new ValidationError('Acesso negado: permissão insuficiente', 403);
  }
  const appointment = await appointmentService.createAppointment(value);
  res.status(201).json(appointment);
});

const getAppointments = asyncHandler(async (req, res) => {
  const { error, value } = getSchema.validate(req.query);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  const appointments = await appointmentService.getAppointments(value);
  res.status(200).json(appointments);
});

const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.getAppointmentById(req.params.id);
  res.status(200).json(appointment);
});

const updateAppointment = asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  if (req.user.role !== 'doctor' && req.user.role !== 'secretary') {
    throw new ValidationError('Acesso negado: permissão insuficiente', 403);
  }
  const appointment = await appointmentService.updateAppointment(req.params.id, value);
  res.status(200).json(appointment);
});

const deleteAppointment = asyncHandler(async (req, res) => {
  await appointmentService.deleteAppointment(req.params.id);
  res.status(204).send();
});

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};