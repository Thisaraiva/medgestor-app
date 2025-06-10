const { Patient } = require('../models');

const createPatient = async (req, res) => {
    try {
        const { name, cpf, phone, allergies } = req.body;
        const patient = await Patient.create({ name, cpf, phone, allergies });
        res.status(201).json(patient);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getPatients = async (req, res) => {
    try {
        const patients = await Patient.findAll();
        res.json(patients);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);
        if (!patient) {
            return res.status(404).json({ error: 'Paciente não encontrado' });
        }
        res.json(patient);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updatePatient = async (req, res) => {
    try {
        const { name, phone, allergies } = req.body;
        const patient = await Patient.findByPk(req.params.id);
        if (!patient) {
            return res.status(404).json({ error: 'Paciente não encontrado' });
        }
        await patient.update({ name, phone, allergies });
        res.json(patient);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);
        if (!patient) {
            return res.status(404).json({ error: 'Paciente não encontrado' });
        }
        await patient.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createPatient, getPatients, getPatientById, updatePatient, deletePatient };