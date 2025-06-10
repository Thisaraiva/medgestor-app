const { Appointment, User, Patient } = require('../models');

const createAppointment = async ({ doctorId, patientId, date, type, insurance }) => {
    return Appointment.create({ doctorId, patientId, date, type, insurance });
};

const getAppointments = async () => {
    return Appointment.findAll({
        include: [
            { model: User, as: 'doctor', attributes: ['id', 'name'] },
            { model: Patient, as: 'patient', attributes: ['id', 'name'] },
        ],
    });
};

const getAppointmentById = async (id) => {
    const appointment = await Appointment.findByPk(id, {
        include: [
            { model: User, as: 'doctor', attributes: ['id', 'name'] },
            { model: Patient, as: 'patient', attributes: ['id', 'name'] },
        ],
    });
    if (!appointment) {
        throw new Error('Consulta não encontrada');
    }
    return appointment;
};

const updateAppointment = async (id, { date, type, insurance }) => {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
        throw new Error('Consulta não encontrada');
    }
    return appointment.update({ date, type, insurance });
};

const deleteAppointment = async (id) => {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
        throw new Error('Consulta não encontrada');
    }
    await appointment.destroy();
};

module.exports = { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment };