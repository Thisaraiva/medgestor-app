const { MedicalRecord, Patient } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');

const validateRecord = ({ patientId }) => {
  if (!patientId) {
    throw new ValidationError('patientId é obrigatório');
  }
};

const createRecord = async ({ patientId, diagnosis, treatment, notes }) => {
  validateRecord({ patientId });
  const patient = await Patient.findByPk(patientId);
  if (!patient) {
    throw new NotFoundError('Paciente não encontrado');
  }
  return MedicalRecord.create({ patientId, diagnosis, treatment, notes });
};

const getRecordsByPatient = async (patientId) => {
  const records = await MedicalRecord.findAll({
    where: { patientId },
    include: { model: Patient, attributes: ['id', 'name'] },
  });
  if (!records.length && !await Patient.findByPk(patientId)) {
    throw new NotFoundError('Paciente não encontrado');
  }
  return records;
};

module.exports = { createRecord, getRecordsByPatient };