const { Appointment, User, Patient } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');
//const { Op } = require('sequelize');
const Joi = require('joi');

const appointmentSchema = Joi.object({
  doctorId: Joi.string().uuid().required(),
  patientId: Joi.string().uuid().required(),
  date: Joi.date().iso().greater('now').required(),
  type: Joi.string().valid('initial', 'return').required(),
  insurance: Joi.boolean().allow(null),
});

const createAppointment = async (data) => {
  const { error } = appointmentSchema.validate(data);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const doctor = await User.findByPk(data.doctorId);
  const patient = await Patient.findByPk(data.patientId);
  if (!doctor || doctor.role !== 'doctor') {
    throw new NotFoundError('Médico não encontrado');
  }
  if (!patient) {
    throw new NotFoundError('Paciente não encontrado');
  }

  const conflictingAppointment = await Appointment.findOne({
    where: {
      doctorId: data.doctorId,
      date: data.date,
    },
  });
  if (conflictingAppointment) {
    throw new ValidationError('Médico já está agendado neste horário');
  }

  return Appointment.create(data);
};

const getAppointments = async ({ status, type, doctorId, patientId }) => {
  const where = {};
  if (status) {
    where.status = status;
  }
  if (type) {
    where.type = type;
  }
  if (doctorId) {
    where.doctorId = doctorId;
  }
  if (patientId) {
    where.patientId = patientId;
  }

  return Appointment.findAll({
    where,
    include: [
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
      { model: Patient, as: 'patient', attributes: ['id', 'name'] },
    ],
  });
};

const getAppointmentById = async (id) => {
  const appointment = await Appointment.findByPk(id, {
    include: [
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
      { model: Patient, as: 'patient', attributes: ['id', 'name'] },
    ],
  });
  if (!appointment) {
    throw new NotFoundError('Consulta não encontrada');
  }
  return appointment;
};

const updateAppointment = async (id, data) => {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) {
    throw new NotFoundError('Consulta não encontrada');
  }

  const updateData = { ...data };
  if (data.date) {
    const { error } = appointmentSchema.validate({ ...data, doctorId: appointment.doctorId, patientId: appointment.patientId });
    if (error) {
      throw new ValidationError(error.details[0].message);
    }
  }

  return appointment.update(updateData);
};

const deleteAppointment = async (id) => {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) {
    throw new NotFoundError('Consulta não encontrada');
  }
  await appointment.destroy();
};

module.exports = { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment };