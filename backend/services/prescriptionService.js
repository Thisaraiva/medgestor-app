const { Prescription, Patient, User } = require('../models');

const createPrescription = async ({ patientId, doctorId, medication, dosage, frequency, duration, administrationInstructions, notes, dateIssued }) => {
    return Prescription.create({
        patientId,
        doctorId,
        medication,
        dosage,
        frequency,
        duration,
        administrationInstructions,
        notes,
        dateIssued,
    });
};

const getPrescriptionsByPatient = async (patientId) => {
    return Prescription.findAll({
        where: { patientId },
        include: [
            { model: Patient, attributes: ['id', 'name'] },
            { model: User, as: 'doctor', attributes: ['id', 'name'] },
        ],
    });
};

module.exports = { createPrescription, getPrescriptionsByPatient };