// backend/services/appointmentService.js
const { Appointment, User, Patient, InsurancePlan } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');
//const { sendAppointmentConfirmation } = require('../utils/email');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

require('moment/locale/pt-br');
const APP_TIMEZONE = 'America/Sao_Paulo';

// FUNÇÃO ÚNICA para validação e parsing de datas
const validateAndParseIsoDate = (isoDateString) => {
  if (!isoDateString) {
    throw new ValidationError('Data é obrigatória');
  }

  // Garante que é UTC e válida
  const parsed = moment.utc(isoDateString);
  if (!parsed.isValid()) {
    throw new ValidationError('Formato de data inválido. Use ISO 8601 UTC.');
  }

  // Converte para timezone local apenas para validação
  const local = parsed.clone().tz(APP_TIMEZONE);
  const now = moment().tz(APP_TIMEZONE);
  
  if (local.isBefore(now)) {
    throw new ValidationError('Data e hora da consulta devem ser futuras');
  }

  return parsed; // Retorna sempre UTC
};

// FUNÇÃO ÚNICA para verificar conflitos
const checkConflict = async (doctorId, dateMoment, excludeId = null) => {
  const slotStart = dateMoment.clone();
  const slotEnd = slotStart.clone().add(30, 'minutes');

  const conflict = await Appointment.findOne({
    where: {
      doctorId,
      [Op.and]: [
        { date: { [Op.gte]: slotStart.toDate() } },
        { date: { [Op.lt]: slotEnd.toDate() } },
      ],
      ...(excludeId && { id: { [Op.ne]: excludeId } }),
    },
  });

  if (conflict) {
    throw new ValidationError('Médico já possui um agendamento neste horário');
  }
};

// FUNÇÃO ÚNICA para formatação de resposta
const formatAppointmentResponse = (appt) => {
  const dateMoment = moment.utc(appt.date);
  const localDate = dateMoment.clone().tz(APP_TIMEZONE);

  return {
    ...appt.toJSON(),
    // Formato BR para exibição
    date: localDate.format('DD/MM/YYYY HH:mm'),
    // Para formulários
    dateOnly: localDate.format('YYYY-MM-DD'),
    timeOnly: localDate.format('HH:mm'),
    // Para calendário (mantém UTC)
    isoStart: dateMoment.toISOString(),
    isoEnd: dateMoment.clone().add(30, 'minutes').toISOString(),
    // Relações formatadas
    doctor: appt.doctor ? { id: appt.doctor.id, name: appt.doctor.name } : null,
    patient: appt.patient ? { id: appt.patient.id, name: appt.patient.name } : null,
    insurancePlan: appt.insurancePlan ? { 
      id: appt.insurancePlan.id, 
      name: appt.insurancePlan.name 
    } : null,
  };
};

const createAppointment = async (data) => {
  const dateMoment = validateAndParseIsoDate(data.date);
  
  await checkConflict(data.doctorId, dateMoment);

  const doctor = await User.findByPk(data.doctorId);
  if (!doctor || doctor.role !== 'doctor') {
    throw new NotFoundError('Médico não encontrado');
  }

  const patient = await Patient.findByPk(data.patientId);
  if (!patient) {
    throw new NotFoundError('Paciente não encontrado');
  }

  if (data.insurance && !data.insurancePlanId) {
    throw new ValidationError('Plano de saúde obrigatório para convênio');
  }

  if (data.insurancePlanId) {
    const plan = await InsurancePlan.findByPk(data.insurancePlanId);
    if (!plan) {
      throw new NotFoundError('Plano de saúde não encontrado');
    }
  }

  const appointment = await Appointment.create({
    id: uuidv4(),
    doctorId: data.doctorId,
    patientId: data.patientId,
    date: dateMoment.toDate(), // Armazena como UTC
    type: data.type,
    insurance: data.insurance,
    insurancePlanId: data.insurance ? data.insurancePlanId : null,
  });

  const fullAppointment = await Appointment.findByPk(appointment.id, {
    include: [
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
      { model: Patient, as: 'patient', attributes: ['id', 'name', 'email'] },
      { model: InsurancePlan, as: 'insurancePlan', attributes: ['id', 'name'] },
    ],
  });

  // Envio de email
  /*if (fullAppointment.patient?.email) {
    const localDate = moment.utc(fullAppointment.date).tz(APP_TIMEZONE);
    await sendAppointmentConfirmation({
      to: fullAppointment.patient.email,
      patientName: fullAppointment.patient.name,
      doctorName: fullAppointment.doctor.name,
      date: localDate.format('DD/MM/YYYY HH:mm'),
      insuranceInfo: fullAppointment.insurance ? fullAppointment.insurancePlan?.name : 'Particular',
    });
  }*/

  return formatAppointmentResponse(fullAppointment);
};

const updateAppointment = async (id, data) => {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) {
    throw new NotFoundError('Consulta não encontrada.');
  }

  let dateMoment = moment.utc(appointment.date);
  if (data.date) {
    dateMoment = validateAndParseIsoDate(data.date);
  }

  const doctorId = data.doctorId || appointment.doctorId;
  await checkConflict(doctorId, dateMoment, id);

  if (data.doctorId) {
    const doctor = await User.findByPk(data.doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      throw new NotFoundError('Médico não encontrado');
    }
  }

  if (data.patientId) {
    const patient = await Patient.findByPk(data.patientId);
    if (!patient) {
      throw new NotFoundError('Paciente não encontrado');
    }
  }

  if (data.insurance !== undefined && data.insurance && !data.insurancePlanId) {
    throw new ValidationError('Plano de saúde obrigatório para convênio');
  }

  await appointment.update({
    ...data,
    date: dateMoment.toDate(),
    insurancePlanId: data.insurance === false ? null : (data.insurancePlanId || appointment.insurancePlanId),
  });

  const updatedAppointment = await Appointment.findByPk(id, {
    include: [
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
      { model: Patient, as: 'patient', attributes: ['id', 'name'] },
      { model: InsurancePlan, as: 'insurancePlan', attributes: ['id', 'name'] },
    ],
  });

  return formatAppointmentResponse(updatedAppointment);
};

const getAppointments = async (filters, currentUser) => {
  const where = {};
  
  if (filters.type) {
    where.type = filters.type;
  }

  // Filtro por médico baseado no perfil
  if (currentUser.role === 'doctor') {
    where.doctorId = currentUser.id;
  } else if (filters.doctorId && filters.doctorId.trim() !== '') {
    where.doctorId = filters.doctorId;
  }

  if (filters.patientId) {
    where.patientId = filters.patientId;
  }

  // Filtro por data
  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date[Op.gte] = moment.utc(filters.startDate).toDate();
    }
    if (filters.endDate) {
      where.date[Op.lte] = moment.utc(filters.endDate).toDate();
    }
  }

  const appointments = await Appointment.findAll({
    where,
    include: [
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
      { model: Patient, as: 'patient', attributes: ['id', 'name'] },
      { model: InsurancePlan, as: 'insurancePlan', attributes: ['id', 'name'] },
    ],
    order: [['date', 'ASC']],
  });

  return appointments.map(formatAppointmentResponse);
};

const getAppointmentById = async (id) => {
  const appointment = await Appointment.findByPk(id, {
    include: [
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
      { model: Patient, as: 'patient', attributes: ['id', 'name'] },
      { model: InsurancePlan, as: 'insurancePlan', attributes: ['id', 'name'] },
    ],
  });

  if (!appointment) {
    throw new NotFoundError('Consulta não encontrada.');
  }

  return formatAppointmentResponse(appointment);
};

const deleteAppointment = async (id) => {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) {
    throw new NotFoundError('Consulta não encontrada.');
  }
  await appointment.destroy();
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};