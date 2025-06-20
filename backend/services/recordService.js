const { MedicalRecord, Patient } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');
const Joi = require('joi');

const recordSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  diagnosis: Joi.string().min(1).required(),
  treatment: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, ''),
  date: Joi.date().iso().required(),
});

const createRecord = async (data) => {
  const { error } = recordSchema.validate(data);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const patient = await Patient.findByPk(data.patientId);
  if (!patient) {
    throw new NotFoundError('Paciente não encontrado');
  }

  return MedicalRecord.create(data);
};

const getRecordsByPatient = async (patientId, { date }) => {
  const where = { patientId };
  if (date) {
    where.date = date;
  }

  const records = await MedicalRecord.findAll({
    where,
    include: [
      { model: Patient, attributes: ['id', 'name'] },
    ],
  });

  if (!records.length && !(await Patient.findByPk(patientId))) {
    throw new NotFoundError('Paciente não encontrado');
  }
  return records;
};

const getRecordById = async (id) => {
  const record = await MedicalRecord.findByPk(id, {
    include: [
      { model: Patient, attributes: ['id', 'name'] },
    ],
  });
  if (!record) {
    throw new NotFoundError('Registro médico não encontrado');
  }
  return record;
};

module.exports = { createRecord, getRecordsByPatient, getRecordById };