const { Appointment, User, Patient } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');
const Joi = require('joi');
const { parse, format, isValid } = require('date-fns');
const { ptBR } = require('date-fns/locale');

const appointmentSchema = Joi.object({
  doctorId: Joi.string().uuid().required(),
  patientId: Joi.string().uuid().required(),
  date: Joi.date().iso().required(), // Aceita data em formato ISO após conversão
  type: Joi.string().valid('initial', 'return').required(),
  insurance: Joi.boolean().allow(null),
});

const createAppointment = async (data) => {
  // Validar data pt-BR (dd/MM/yyyy HH:mm)
  // Usar uma data de referência consistente para parsear
  const parsedDate = parse(data.date, 'dd/MM/yyyy HH:mm', new Date(), { locale: ptBR });
  if (!isValid(parsedDate)) {
    throw new ValidationError('Formato de data inválido');
  }
  if (parsedDate <= new Date()) { // Comparar com a data/hora atual
    throw new ValidationError('Data deve ser futura');
  }

  // Converter para ISO 8601
  const isoDate = format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");
  const validatedData = { ...data, date: isoDate };

  // Validar com Joi
  const { error } = appointmentSchema.validate(validatedData);
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
      date: isoDate,
    },
  });
  if (conflictingAppointment) {
    throw new ValidationError('Médico já está agendado neste horário');
  }

  const appointment = await Appointment.create(validatedData);
  // Retornar data formatada em pt-BR
  return { ...appointment.toJSON(), date: format(new Date(appointment.date), 'dd/MM/yyyy HH:mm', { locale: ptBR }) };
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

  const appointments = await Appointment.findAll({
    where,
    include: [
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
      { model: Patient, as: 'patient', attributes: ['id', 'name'] },
    ],
  });

  // Retornar datas formatadas em pt-BR
  return appointments.map((appt) => ({
    ...appt.toJSON(),
    date: format(new Date(appt.date), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
  }));
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
  return {
    ...appointment.toJSON(),
    date: format(new Date(appointment.date), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
  };
};

const updateAppointment = async (id, data) => {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) {
    throw new NotFoundError('Consulta não encontrada');
  }

  const updateData = { ...data };
  if (data.date) {
    // Usar uma data de referência consistente para parsear
    const parsedDate = parse(data.date, 'dd/MM/yyyy HH:mm', new Date(), { locale: ptBR });
    if (!isValid(parsedDate)) {
      throw new ValidationError('Formato de data inválido');
    }
    if (parsedDate <= new Date()) { // Comparar com a data/hora atual
      throw new ValidationError('Data deve ser futura');
    }
    updateData.date = format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");
  }

  const { error } = appointmentSchema.validate({
    ...updateData,
    doctorId: updateData.doctorId || appointment.doctorId,
    patientId: updateData.patientId || appointment.patientId,
  });
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  await appointment.update(updateData);
  return {
    ...appointment.toJSON(),
    date: format(new Date(appointment.date), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
  };
};

const deleteAppointment = async (id) => {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) {
    throw new NotFoundError('Consulta não encontrada');
  }
  await appointment.destroy();
};

module.exports = { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment };