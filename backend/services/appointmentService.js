// Arquivo C:\Programacao\Projetos\JavaScript\medgestor-app\backend\services\appointmentService.js
const { Appointment, User, Patient, InsurancePlan } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');
const { sendAppointmentConfirmation } = require('../utils/email');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

require('moment/locale/pt-br');

const APP_TIMEZONE = 'America/Sao_Paulo';

const validateAndParseIsoDate = (isoDateString) => {
  const parsedMoment = moment.utc(isoDateString);

  if (!parsedMoment.isValid()) {
    throw new ValidationError('Formato de data e hora inválido (esperado: ISO 8601).');
  }

  const dateInAppTimezone = parsedMoment.tz(APP_TIMEZONE);

  if (dateInAppTimezone.isBefore(moment().tz(APP_TIMEZONE))) {
    throw new ValidationError('A data e hora da consulta devem ser futuras.');
  }

  return parsedMoment;
};

const formatUtcDateToLocalString = (dateObj) => {
  return moment.utc(dateObj).tz(APP_TIMEZONE).format('DD/MM/YYYY HH:mm');
};

const formatUtcDateToLocalDateInput = (dateObj) => {
  return moment.utc(dateObj).tz(APP_TIMEZONE).format('YYYY-MM-DD');
};

const formatUtcDateToLocalTimeInput = (dateObj) => {
  return moment.utc(dateObj).tz(APP_TIMEZONE).format('HH:mm');
};

const createAppointment = async (data) => {
  const appointmentDateMomentUtc = validateAndParseIsoDate(data.date);

  const doctor = await User.findByPk(data.doctorId);
  if (!doctor || doctor.role !== 'doctor') {
    throw new NotFoundError('Médico não encontrado ou não é um médico válido.');
  }

  const patient = await Patient.findByPk(data.patientId);
  if (!patient) {
    throw new NotFoundError('Paciente não encontrado.');
  }

  if (data.insurance && !data.insurancePlanId) {
    throw new ValidationError('O ID do plano de saúde é obrigatório quando a consulta é por convênio.');
  }
  if (data.insurancePlanId) {
    const insurancePlan = await InsurancePlan.findByPk(data.insurancePlanId);
    if (!insurancePlan) {
      throw new NotFoundError('Plano de saúde não encontrado.');
    }
  }

  const startOfAppointmentHour = appointmentDateMomentUtc.clone().startOf('hour');
  const endOfAppointmentHour = appointmentDateMomentUtc.clone().add(1, 'hour').startOf('hour');

  const existingAppointment = await Appointment.findOne({
    where: {
      doctorId: data.doctorId,
      date: {
        [Op.between]: [startOfAppointmentHour.toDate(), endOfAppointmentHour.toDate()],
      },
    },
  });

  if (existingAppointment) {
    throw new ValidationError('Médico já possui um agendamento neste horário.');
  }

  const appointment = await Appointment.create({
    id: uuidv4(),
    doctorId: data.doctorId,
    patientId: data.patientId,
    date: appointmentDateMomentUtc.toDate(),
    type: data.type,
    insurance: data.insurance,
    insurancePlanId: data.insurance ? data.insurancePlanId : null,
  });

  const createdAppointmentWithDetails = await Appointment.findByPk(appointment.id, {
    include: [
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
      { model: Patient, as: 'patient', attributes: ['id', 'name', 'email'] },
      { model: InsurancePlan, as: 'insurancePlan', attributes: ['id', 'name'] },
    ],
  });

  if (createdAppointmentWithDetails.patient?.email) {
    await sendAppointmentConfirmation({
      to: createdAppointmentWithDetails.patient.email,
      patientName: createdAppointmentWithDetails.patient.name,
      doctorName: createdAppointmentWithDetails.doctor.name,
      date: formatUtcDateToLocalString(createdAppointmentWithDetails.date),
      insuranceInfo: createdAppointmentWithDetails.insurance ? createdAppointmentWithDetails.insurancePlan?.name : 'Particular'
    });
  }

  return {
    ...createdAppointmentWithDetails.toJSON(),
    date: formatUtcDateToLocalString(createdAppointmentWithDetails.date),
    dateOnly: formatUtcDateToLocalDateInput(createdAppointmentWithDetails.date),
    timeOnly: formatUtcDateToLocalTimeInput(createdAppointmentWithDetails.date),
    doctor: { id: createdAppointmentWithDetails.doctor.id, name: createdAppointmentWithDetails.doctor.name },
    patient: { id: createdAppointmentWithDetails.patient.id, name: createdAppointmentWithDetails.patient.name },
    insurancePlan: createdAppointmentWithDetails.insurancePlan ? { id: createdAppointmentWithDetails.insurancePlan.id, name: createdAppointmentWithDetails.insurancePlan.name } : null,
  };
};

const getAppointments = async (filters) => {
  const where = {};
  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.doctorId) {
    where.doctorId = filters.doctorId;
  }
  if (filters.patientId) {
    where.patientId = filters.patientId;
  }
  if (filters.startDate && filters.endDate) {
    const start = moment.utc(filters.startDate);
    const end = moment.utc(filters.endDate);
    if (start.isValid() && end.isValid()) {
      where.date = {
        [Op.between]: [start.toDate(), end.toDate()],
      };
    }
  } else if (filters.startDate) {
    const start = moment.utc(filters.startDate);
    if (start.isValid()) {
      where.date = {
        [Op.gte]: start.toDate(),
      };
    }
  } else if (filters.endDate) {
    const end = moment.utc(filters.endDate);
    if (end.isValid()) {
      where.date = {
        [Op.lte]: end.toDate(),
      };
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

  return appointments.map(appointment => ({
    ...appointment.toJSON(),
    date: formatUtcDateToLocalString(appointment.date),
    dateOnly: formatUtcDateToLocalDateInput(appointment.date),
    timeOnly: formatUtcDateToLocalTimeInput(appointment.date),
    insurancePlan: appointment.insurancePlan ? { id: appointment.insurancePlan.id, name: appointment.insurancePlan.name } : null,
  }));
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

  return {
    ...appointment.toJSON(),
    date: formatUtcDateToLocalString(appointment.date),
    dateOnly: formatUtcDateToLocalDateInput(appointment.date),
    timeOnly: formatUtcDateToLocalTimeInput(appointment.date),
    insurancePlan: appointment.insurancePlan ? { id: appointment.insurancePlan.id, name: appointment.insurancePlan.name } : null,
  };
};

const updateAppointment = async (id, data) => {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) {
    throw new NotFoundError('Consulta não encontrada.');
  }

  let updatedDateMomentUtc = moment.utc(appointment.date);
  if (data.date) {
    updatedDateMomentUtc = validateAndParseIsoDate(data.date);
  }

  if (data.doctorId) {
    const doctor = await User.findByPk(data.doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      throw new NotFoundError('Médico não encontrado ou não é um médico válido.');
    }
  }
  if (data.patientId) {
    const patient = await Patient.findByPk(data.patientId);
    if (!patient) {
      throw new NotFoundError('Paciente não encontrado.');
    }
  }

  if (data.insurance !== undefined) {
    if (data.insurance && !data.insurancePlanId) {
      throw new ValidationError('O ID do plano de saúde é obrigatório quando a consulta é por convênio.');
    }
    if (!data.insurance && data.insurancePlanId) {
      data.insurancePlanId = null;
    }
  } else if (data.insurancePlanId) {
    const insurancePlan = await InsurancePlan.findByPk(data.insurancePlanId);
    if (!insurancePlan) {
      throw new NotFoundError('Plano de saúde não encontrado.');
    }
  }

  if (data.date || data.doctorId) {
    const doctorIdToCheck = data.doctorId || appointment.doctorId;
    const dateToCheckMoment = updatedDateMomentUtc;

    const startOfAppointmentHour = dateToCheckMoment.clone().startOf('hour');
    const endOfAppointmentHour = dateToCheckMoment.clone().add(1, 'hour').startOf('hour');

    const existingConflict = await Appointment.findOne({
      where: {
        doctorId: doctorIdToCheck,
        date: {
          [Op.between]: [startOfAppointmentHour.toDate(), endOfAppointmentHour.toDate()],
        },
        id: {
          [Op.ne]: id,
        },
      },
    });

    if (existingConflict) {
      throw new ValidationError('Médico já possui um agendamento neste horário.');
    }
  }

  await appointment.update({
    ...data,
    date: updatedDateMomentUtc.toDate(),
    insurancePlanId: data.insurance !== undefined ? (data.insurance ? data.insurancePlanId : null) : appointment.insurancePlanId,
  });

  const updatedAppointment = await Appointment.findByPk(id, {
    include: [
      { model: User, as: 'doctor', attributes: ['id', 'name'] },
      { model: Patient, as: 'patient', attributes: ['id', 'name'] },
      { model: InsurancePlan, as: 'insurancePlan', attributes: ['id', 'name'] },
    ],
  });

  return {
    ...updatedAppointment.toJSON(),
    date: formatUtcDateToLocalString(updatedAppointment.date),
    dateOnly: formatUtcDateToLocalDateInput(updatedAppointment.date),
    timeOnly: formatUtcDateToLocalTimeInput(updatedAppointment.date),
    insurancePlan: updatedAppointment.insurancePlan ? { id: updatedAppointment.insurancePlan.id, name: updatedAppointment.insurancePlan.name } : null,
  };
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