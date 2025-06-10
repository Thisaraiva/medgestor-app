const { MedicalRecord, Patient } = require('../models');

const createRecord = async ({ patientId, diagnosis, treatment, notes }) => {
    return MedicalRecord.create({ patientId, diagnosis, treatment, notes });
};

const getRecordsByPatient = async (patientId) => {
    return MedicalRecord.findAll({
        where: { patientId },
        include: { model: Patient, attributes: ['id', 'name'] },
    });
};

module.exports = { createRecord, getRecordsByPatient };