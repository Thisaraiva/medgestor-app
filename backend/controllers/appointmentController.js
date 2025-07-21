const asyncHandler = require('../middleware/controllerMiddleware');
const appointmentService = require('../services/appointmentService');
const { ValidationError } = require('../errors/errors');
// const { sendAppointmentConfirmation } = require('../utils/email'); // Manter comentado por enquanto
const Joi = require('joi');

// Regex para validar o formato ISO 8601 completo (YYYY-MM-DDTHH:mm:ss.sssZ)
// Este formato é o que `new Date().toISOString()` produz.
const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

// Schema para criação de agendamento (todos os campos necessários)
const createSchema = Joi.object({
  doctorId: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do médico deve ser um UUID válido',
    'any.required': 'ID do médico é obrigatório',
  }),
  patientId: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do paciente deve ser um UUID válido',
    'any.required': 'ID do paciente é obrigatório',
  }),
  // A data será esperada no formato ISO 8601 (ex: "2025-07-10T10:30:00.000Z")
  date: Joi.string().pattern(ISO_8601_REGEX).required().messages({ // CORRIGIDO: Usando .pattern()
    'string.pattern.base': 'Data deve estar no formato ISO 8601 (ex: AAAA-MM-DDTHH:mm:ss.sssZ)',
    'any.required': 'Data é obrigatória',
  }),
  type: Joi.string().valid('initial', 'return').required().messages({
    'any.only': 'Tipo deve ser "initial" ou "return"',
    'any.required': 'Tipo é obrigatório',
  }),
  insurance: Joi.boolean().required().messages({ // 'insurance' agora é obrigatório
    'boolean.base': 'Seguro deve ser um valor booleano (true/false)',
    'any.required': 'O campo seguro é obrigatório para agendamento',
  }),
  // insurancePlanId é opcional, mas se 'insurance' for true, ele é obrigatório
  insurancePlanId: Joi.string().uuid().when('insurance', {
    is: true,
    then: Joi.required().messages({
      'any.required': 'ID do plano de saúde é obrigatório quando "seguro" é true',
      'string.uuid': 'ID do plano de saúde deve ser um UUID válido',
    }),
    otherwise: Joi.allow(null), // CORRIGIDO: Permite que insurancePlanId seja null se insurance for false
  }).messages({
    'string.uuid': 'ID do plano de saúde deve ser um UUID válido',
  }),
});

// Schema para atualização de agendamento (todos os campos são opcionais)
const updateSchema = Joi.object({
  doctorId: Joi.string().uuid().messages({
    'string.uuid': 'ID do médico deve ser um UUID válido',
  }),
  patientId: Joi.string().uuid().messages({
    'string.uuid': 'ID do paciente deve ser um UUID válido',
  }),
  // A data será esperada no formato ISO 8601 (ex: "2025-07-10T10:30:00.000Z")
  date: Joi.string().pattern(ISO_8601_REGEX).messages({ // CORRIGIDO: Usando .pattern()
    'string.pattern.base': 'Data deve estar no formato ISO 8601 (ex: AAAA-MM-DDTHH:mm:ss.sssZ)',
  }),
  type: Joi.string().valid('initial', 'return').messages({
    'any.only': 'Tipo deve ser "initial" ou "return"',
  }),
  insurance: Joi.boolean().messages({
    'boolean.base': 'Seguro deve ser um valor booleano',
  }),
  // insurancePlanId é opcional, mas se 'insurance' for true, ele é obrigatório
  insurancePlanId: Joi.string().uuid().when('insurance', {
    is: true,
    then: Joi.required().messages({
      'any.required': 'ID do plano de saúde é obrigatório quando "seguro" é true',
      'string.uuid': 'ID do plano de saúde deve ser um UUID válido',
    }),
    otherwise: Joi.allow(null), // CORRIGIDO: Permite que insurancePlanId seja null se insurance for false
  }).messages({
    'string.uuid': 'ID do plano de saúde deve ser um UUID válido',
  }),
}).min(1); // Pelo menos um campo deve ser fornecido para atualização

const getSchema = Joi.object({
  type: Joi.string().valid('initial', 'return').optional(),
  doctorId: Joi.string().uuid().optional().messages({
    'string.uuid': 'ID do médico deve ser um UUID válido',
  }),
  patientId: Joi.string().uuid().optional().messages({
    'string.uuid': 'ID do paciente deve ser um UUID válido',
  }),
  // Adicionar validação para query params de data, se necessário (espera ISO 8601)
  startDate: Joi.string().pattern(ISO_8601_REGEX).optional().messages({ // CORRIGIDO: Usando .pattern()
    'string.pattern.base': 'Data de início deve estar no formato ISO 8601',
  }),
  endDate: Joi.string().pattern(ISO_8601_REGEX).optional().messages({ // CORRIGIDO: Usando .pattern()
    'string.pattern.base': 'Data de fim deve estar no formato ISO 8601',
  }),
});

const createAppointment = asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
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
  const { error, value } = updateSchema.validate(req.body, { abortEarly: false, allowUnknown: false });
  if (error) {
    throw new ValidationError(error.details.map(x => x.message).join(', '));
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
