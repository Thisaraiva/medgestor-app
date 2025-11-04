// backend/services/appointmentService.js
const { Appointment, User, Patient, InsurancePlan } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');
const { sendAppointmentConfirmation } = require('../utils/email');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
require('moment/locale/pt-br');
const APP_TIMEZONE = 'America/Sao_Paulo';

const alignToSlotStart = (dateMoment) => {
  const minutes = dateMoment.minutes();
  const slotMinutes = Math.floor(minutes / 30) * 30;
  return dateMoment.clone().minutes(slotMinutes).seconds(0).milliseconds(0);
};

const checkConflict = async (doctorId, dateMoment, excludeId = null) => {
  const local = dateMoment.tz(APP_TIMEZONE);
  const slotStart = alignToSlotStart(local);
  const slotEnd = slotStart.clone().add(30, 'minutes');

  const conflict = await Appointment.findOne({
    where: {
      doctorId,
      [Op.and]: [
        { date: { [Op.gte]: slotStart.clone().subtract(29, 'minutes').toDate() } },
        { date: { [Op.lt]: slotEnd.toDate() } },
      ],
      ...(excludeId && { id: { [Op.ne]: excludeId } }),
    },
  });

  if (conflict) {
    //const conflictTime = moment.utc(conflict.date).tz(APP_TIMEZONE).format('HH:mm');
    throw new ValidationError(`Médico já possui um agendamento neste horário`);
  }
};

const validateAndParseIsoDate = (isoDateString) => {
  const parsed = moment.utc(isoDateString);
  if (!parsed.isValid()) {
    throw new ValidationError('Formato de data inválido. Use ISO 8601.');
  }
  const local = parsed.tz(APP_TIMEZONE);
  if (local.isBefore(moment().tz(APP_TIMEZONE))) {
    throw new ValidationError('data e hora da consulta devem ser futuras');
  }
  return parsed;
};

const formatDate = (date) => moment.utc(date).tz(APP_TIMEZONE);

const createAppointment = async (data) => {
  const dateMoment = validateAndParseIsoDate(data.date);
  await checkConflict(data.doctorId, dateMoment);
  const doctor = await User.findByPk(data.doctorId);
  if (!doctor || doctor.role !== 'doctor') throw new NotFoundError('Médico não encontrado');
  const patient = await Patient.findByPk(data.patientId);
  if (!patient) throw new NotFoundError('Paciente não encontrado.');
  if (data.insurance && !data.insurancePlanId) {
    throw new ValidationError('Plano de saúde obrigatório para convênio.');
  }
  if (data.insurancePlanId) {
    const plan = await InsurancePlan.findByPk(data.insurancePlanId);
    if (!plan) throw new NotFoundError('Plano de saúde não encontrado.');
  }
  const appointment = await Appointment.create({
    id: uuidv4(),
    doctorId: data.doctorId,
    patientId: data.patientId,
    date: dateMoment.toDate(),
    type: data.type,
    insurance: data.insurance,
    insurancePlanId: data.insurance ? data.insurancePlanId : null,
  });
  const full = await Appointment.findByPk(appointment.id, {
    include: [
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
      { model: Patient, as: 'patient', attributes: ['id', 'name', 'email'] },
      { model: InsurancePlan, as: 'insurancePlan', attributes: ['id', 'name'] },
    ],
  });
  if (full.patient?.email) {
    await sendAppointmentConfirmation({
      to: full.patient.email,
      patientName: full.patient.name,
      doctorName: full.doctor.name,
      date: formatDate(full.date).format('DD/MM/YYYY HH:mm'),
      insuranceInfo: full.insurance ? full.insurancePlan?.name : 'Particular',
    });
  }
  return formatAppointmentResponse(full);
};

const updateAppointment = async (id, data) => {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) throw new NotFoundError('Consulta não encontrada.');
  let dateMoment = moment.utc(appointment.date);
  if (data.date) {
    dateMoment = validateAndParseIsoDate(data.date);
  }
  const doctorId = data.doctorId || appointment.doctorId;
  await checkConflict(doctorId, dateMoment, id);

  if (data.doctorId) {
    const doctor = await User.findByPk(data.doctorId);
    if (!doctor || doctor.role !== 'doctor') throw new NotFoundError('Médico não encontrado');
  }
  if (data.patientId) {
    const patient = await Patient.findByPk(data.patientId);
    if (!patient) throw new NotFoundError('Paciente não encontrado.');
  }
  await appointment.update({
    ...data,
    date: dateMoment.toDate(),
    insurancePlanId: data.insurance === false ? null : data.insurancePlanId,
  });
  const updated = await Appointment.findByPk(id, {
    include: [
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
      { model: Patient, as: 'patient', attributes: ['id', 'name'] },
      { model: InsurancePlan, as: 'insurancePlan', attributes: ['id', 'name'] },
    ],
  });
  return formatAppointmentResponse(updated);
};

const formatAppointmentResponse = (appt) => ({
  ...appt.toJSON(),
  date: formatDate(appt.date).format('DD/MM/YYYY HH:mm'),
  dateOnly: formatDate(appt.date).format('YYYY-MM-DD'),
  timeOnly: formatDate(appt.date).format('HH:mm'),
  doctor: appt.doctor ? { id: appt.doctor.id, name: appt.doctor.name } : null,
  patient: appt.patient ? { id: appt.patient.id, name: appt.patient.name } : null,
  insurancePlan: appt.insurancePlan ? { id: appt.insurancePlan.id, name: appt.insurancePlan.name } : null,
});

const getAppointments = async (filters, currentUser) => {
  const where = buildFilters(filters, currentUser);
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

const buildFilters = (filters, currentUser) => {
  const where = {};
  if (filters.type) where.type = filters.type;
  if (currentUser.role === 'doctor') {
    where.doctorId = currentUser.id;
  } else if (filters.doctorId && filters.doctorId.trim() !== '') {
    where.doctorId = filters.doctorId;
  }
  if (filters.patientId) where.patientId = filters.patientId;
  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) where.date[Op.gte] = moment.utc(filters.startDate).toDate();
    if (filters.endDate) where.date[Op.lte] = moment.utc(filters.endDate).toDate();
  }
  return where;
};

const getAppointmentById = async (id) => {
  const appt = await Appointment.findByPk(id, {
    include: [
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
      { model: Patient, as: 'patient', attributes: ['id', 'name'] },
      { model: InsurancePlan, as: 'insurancePlan', attributes: ['id', 'name'] },
    ],
  });
  if (!appt) throw new NotFoundError('Consulta não encontrada.');
  return formatAppointmentResponse(appt);
};

const deleteAppointment = async (id) => {
  const appt = await Appointment.findByPk(id);
  if (!appt) throw new NotFoundError('Consulta não encontrada.');
  await appt.destroy();
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};