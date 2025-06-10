const { Patient } = require('../models');

const createPatient = async ({ name, cpf, phone, allergies }) => {
    return Patient.create({ name, cpf, phone, allergies });
};

const getPatients = async () => {
    return Patient.findAll();
};

const getPatientById = async (id) => {
    const patient = await Patient.findByPk(id);
    if (!patient) {
        throw new Error('Paciente não encontrado');
    }
    return patient;
};

const updatePatient = async (id, { name, phone, allergies }) => {
    const patient = await Patient.findByPk(id);
    if (!patient) {
        throw new Error('Paciente não encontrado');
    }
    return patient.update({ name, phone, allergies });
};

const deletePatient = async (id) => {
    const patient = await Patient.findByPk(id);
    if (!patient) {
        throw new Error('Paciente não encontrado');
    }
    await patient.destroy();
};

module.exports = { createPatient, getPatients, getPatientById, updatePatient, deletePatient };