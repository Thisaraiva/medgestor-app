// C:\Programacao\Projetos\JavaScript\medgestor-app\backend\services\recordService.js

const { MedicalRecord, Patient, Appointment } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');
const { updateAppointmentStatus } = require('./appointmentService');
const moment = require('moment-timezone');
const { Op } = require('sequelize');

const APP_TIMEZONE = 'America/Sao_Paulo';

// Valida e converte uma string ISO 8601 para um objeto Moment UTC.
const validateAndParseIsoDate = (isoDateString) => {
  const parsedMoment = moment.utc(isoDateString);
  if (!parsedMoment.isValid()) {
    throw new ValidationError('Formato de data e hora inválido (esperado: ISO 8601).');
  }
  return parsedMoment;
};

// Função auxiliar para formatar um registro médico para o retorno da API
const formatRecord = (record) => {
  if (!record) {return null}
  const formattedRecord = record.toJSON();
  formattedRecord.date = moment.utc(formattedRecord.date).tz(APP_TIMEZONE).format('DD/MM/YYYY HH:mm');

  // Adiciona a propriedade do paciente se ela existir
  if (formattedRecord.Patient) {
      formattedRecord.patient = formattedRecord.Patient;
      delete formattedRecord.Patient;
  }

  if (formattedRecord.Appointment) {
    formattedRecord.appointment = {
      ...formattedRecord.Appointment,
      date: moment.utc(formattedRecord.Appointment.date).tz(APP_TIMEZONE).format('DD/MM/YYYY HH:mm')
    };
    delete formattedRecord.Appointment; // Remove a propriedade antiga
  }

  return formattedRecord;
};

// Objeto de inclusão comum para as consultas
const commonIncludes = [
  { model: Patient, attributes: ['id', 'name'] },
  { model: Appointment, as: 'Appointment', attributes: ['id', 'date', 'type'] },
];

const createRecord = async (data) => {
  const recordDateMomentUtc = validateAndParseIsoDate(data.date);
  const patient = await Patient.findByPk(data.patientId);
  if (!patient) {
    throw new NotFoundError('Paciente não encontrado');
  }

  // Atualiza o status do agendamento se um for fornecido
  if (data.appointmentId) {
    const appointment = await Appointment.findByPk(data.appointmentId);
    if (!appointment) {
      throw new NotFoundError('Agendamento não encontrado.');
    }
    if (appointment.status !== 'completed' && appointment.status !== 'canceled') {
      try {
        await updateAppointmentStatus(data.appointmentId, 'completed');
      } catch (error) {
        console.error("Erro ao atualizar o status da consulta:", error);
      }
    }
  }

  const newRecord = await MedicalRecord.create({
    ...data,
    date: recordDateMomentUtc.toDate(),
  });

  const createdRecordWithIncludes = await MedicalRecord.findByPk(newRecord.id, {
    include: commonIncludes
  });
  
  return formatRecord(createdRecordWithIncludes);
};

const getRecordsByPatient = async (patientId, filters = {}) => {
  const patient = await Patient.findByPk(patientId);
  if (!patient) {
    throw new NotFoundError('Paciente não encontrado');
  }

  const where = { patientId };

  if (filters.startDate && filters.endDate) {
    const start = validateAndParseIsoDate(filters.startDate);
    const end = validateAndParseIsoDate(filters.endDate);
    where.date = {
      [Op.between]: [start.toDate(), end.toDate()],
    };
  } else if (filters.startDate) {
    const start = validateAndParseIsoDate(filters.startDate);
    where.date = {
      [Op.gte]: start.toDate(),
    };
  } else if (filters.endDate) {
    const end = validateAndParseIsoDate(filters.endDate);
    where.date = {
      [Op.lte]: end.toDate(),
    };
  }

  const records = await MedicalRecord.findAll({
    where,
    include: commonIncludes,
    order: [['date', 'DESC']],
  });
  
  return records.map(formatRecord);
};

const getRecordById = async (id) => {
  const record = await MedicalRecord.findByPk(id, {
    include: commonIncludes,
  });
  if (!record) {
    throw new NotFoundError('Registro médico não encontrado');
  }
  return formatRecord(record);
};

const updateRecord = async (id, data) => {
  const record = await MedicalRecord.findByPk(id);
  if (!record) {
    throw new NotFoundError('Registro médico não encontrado.');
  }

  const dataToUpdate = { ...data };
  if (data.date) {
    const updatedRecordDateMomentUtc = validateAndParseIsoDate(data.date);
    dataToUpdate.date = updatedRecordDateMomentUtc.toDate();
  }

  delete dataToUpdate.patientId;
  delete dataToUpdate.appointmentId;

  await record.update(dataToUpdate);

  // CORREÇÃO: Busca o prontuário atualizado com as inclusões de paciente e agendamento
  const updatedRecord = await MedicalRecord.findByPk(id, {
    include: commonIncludes,
  });
  
  return formatRecord(updatedRecord);
};

const deleteRecord = async (id) => {
  const record = await MedicalRecord.findByPk(id);
  if (!record) {
    throw new NotFoundError('Registro médico não encontrado.');
  }
  await record.destroy();
};

module.exports = { createRecord, getRecordsByPatient, getRecordById, updateRecord, deleteRecord };