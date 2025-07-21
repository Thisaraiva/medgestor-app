const { MedicalRecord, Patient, Appointment } = require('../models'); // Adicionado Appointment
const { NotFoundError, ValidationError } = require('../errors/errors');
const moment = require('moment-timezone'); // Usando moment
const { Op } = require('sequelize');

// Define o fuso horário da aplicação.
const APP_TIMEZONE = 'America/Sao_Paulo'; 

/**
 * Valida e parseia uma string de data ISO 8601 para um objeto Moment em UTC.
 * @param {string} isoDateString A string da data no formato ISO 8601.
 * @returns {moment.Moment} O objeto Moment validado em UTC.
 * @throws {ValidationError} Se o formato da data for inválido.
 */
const validateAndParseIsoDate = (isoDateString) => {
    const parsedMoment = moment.utc(isoDateString);
    if (!parsedMoment.isValid()) {
        throw new ValidationError('Formato de data e hora inválido (esperado: ISO 8601).');
    }
    return parsedMoment;
};

/**
 * Formata um objeto Date (UTC) para uma string legível no fuso horário da aplicação.
 * @param {Date} dateObj O objeto Date em UTC.
 * @returns {string} A data formatada na string local.
 */
const formatUtcDateToLocalString = (dateObj) => {
    return moment.utc(dateObj).tz(APP_TIMEZONE).format('DD/MM/YYYY HH:mm');
};

const createRecord = async (data) => {
  // Valida e converte a data para Moment UTC
  const recordDateMomentUtc = validateAndParseIsoDate(data.date);

  const patient = await Patient.findByPk(data.patientId);
  if (!patient) {
    throw new NotFoundError('Paciente não encontrado');
  }

  // Se um appointmentId for fornecido, verifica se o agendamento existe
  if (data.appointmentId) {
    const appointment = await Appointment.findByPk(data.appointmentId);
    if (!appointment) {
      throw new NotFoundError('Agendamento não encontrado.');
    }
    // Opcional: Você pode adicionar lógica aqui para verificar se o agendamento já tem um prontuário
    // ou para atualizar o status do agendamento para 'completed' após a criação do prontuário.
    // Isso será feito na lógica de "iniciar/finalizar" consulta.
  }

  return MedicalRecord.create({
    ...data,
    date: recordDateMomentUtc.toDate(), // Salva a data em UTC (objeto Date)
  });
};

const getRecordsByPatient = async (patientId, filters = {}) => {
  const where = { patientId };

  // Adicionar filtros de data se presentes
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
    include: [
      { model: Patient, attributes: ['id', 'name'] },
      { model: Appointment, as: 'Appointment', attributes: ['id', 'date', 'type'] }, // Inclui dados do agendamento
    ],
    order: [['date', 'DESC']], // Ordena por data mais recente primeiro
  });

  if (!records.length && !(await Patient.findByPk(patientId))) {
    throw new NotFoundError('Paciente não encontrado');
  }

  // Formata a data de cada registro para o frontend
  return records.map(record => ({
    ...record.toJSON(),
    date: formatUtcDateToLocalString(record.date),
    appointment: record.Appointment ? {
      ...record.Appointment.toJSON(),
      date: formatUtcDateToLocalString(record.Appointment.date) // Formata a data do agendamento também
    } : null
  }));
};

const getRecordById = async (id) => {
  const record = await MedicalRecord.findByPk(id, {
    include: [
      { model: Patient, attributes: ['id', 'name'] },
      { model: Appointment, as: 'Appointment', attributes: ['id', 'date', 'type'] },
    ],
  });
  if (!record) {
    throw new NotFoundError('Registro médico não encontrado');
  }
  // Formata a data do registro e do agendamento antes de retornar
  return {
    ...record.toJSON(),
    date: formatUtcDateToLocalString(record.date),
    appointment: record.Appointment ? {
      ...record.Appointment.toJSON(),
      date: formatUtcDateToLocalString(record.Appointment.date)
    } : null
  };
};

const updateRecord = async (id, data) => {
  const record = await MedicalRecord.findByPk(id);
  if (!record) {
    throw new NotFoundError('Registro médico não encontrado.');
  }

  // Valida e converte a data se ela for fornecida
  let updatedRecordDateMomentUtc = moment.utc(record.date); // Mantém a data original
  if (data.date) {
    updatedRecordDateMomentUtc = validateAndParseIsoDate(data.date);
  }

  // Não permitimos a atualização de patientId ou appointmentId diretamente aqui
  // Eles devem ser definidos na criação.
  const dataToUpdate = { ...data };
  delete dataToUpdate.patientId;
  delete dataToUpdate.appointmentId;

  await record.update({
    ...dataToUpdate,
    date: updatedRecordDateMomentUtc.toDate(), // Salva a data em UTC (objeto Date)
  });

  // Recarrega para incluir associações atualizadas e formata a data
  const updatedRecord = await MedicalRecord.findByPk(id, {
    include: [
      { model: Patient, attributes: ['id', 'name'] },
      { model: Appointment, as: 'Appointment', attributes: ['id', 'date', 'type'] },
    ],
  });

  return {
    ...updatedRecord.toJSON(),
    date: formatUtcDateToLocalString(updatedRecord.date),
    appointment: updatedRecord.Appointment ? {
      ...updatedRecord.Appointment.toJSON(),
      date: formatUtcDateToLocalString(updatedRecord.Appointment.date)
    } : null
  };
};

const deleteRecord = async (id) => {
  const record = await MedicalRecord.findByPk(id);
  if (!record) {
    throw new NotFoundError('Registro médico não encontrado.');
  }
  await record.destroy();
};

module.exports = { createRecord, getRecordsByPatient, getRecordById, updateRecord, deleteRecord };
