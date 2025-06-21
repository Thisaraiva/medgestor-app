const asyncHandler = require('../middleware/controllerMiddleware');
const appointmentService = require('../services/appointmentService');
const { ValidationError } = require('../errors/errors');
//const { sendAppointmentConfirmation } = require('../utils/email');
const Joi = require('joi');

const createSchema = Joi.object({
  doctorId: Joi.string().uuid().required(),
  patientId: Joi.string().uuid().required(),
  date: Joi.string().pattern(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/).required(),
  type: Joi.string().valid('initial', 'return').required(),
  insurance: Joi.boolean().allow(null),
});

const createAppointment = asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const appointment = await appointmentService.createAppointment(value);
 /* await sendAppointmentConfirmation(req.body.email, {
    date: appointment.date,
    doctorName: appointment.doctorId,
  });*/
  res.status(201).json(appointment);
});

const getAppointments = asyncHandler(async (req, res) => {
  const { status, type, doctorId, patientId } = req.query;
  const appointments = await appointmentService.getAppointments({ status, type, doctorId, patientId });
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