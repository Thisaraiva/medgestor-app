// Arquivo: C:\Programacao\Projetos\JavaScript\medgestor-app\backend\services\appointmentService.js

const { Appointment, User, Patient } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');
const { sendAppointmentConfirmation } = require('../utils/email');
const { parse, isValid, isFuture, format, addHours, startOfHour } = require('date-fns'); // Adicionado startOfHour
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const { Op } = require('sequelize');
const { ptBR } = require('date-fns/locale');
const { v4: uuidv4 } = require('uuid');

const APP_TIMEZONE = 'America/Sao_Paulo'; // Fuso horário da aplicação

/**
 * Valida o formato da data e se ela é futura.
 * @param {string} dateString A string da data a ser validada (dd/MM/yyyy HH:mm).
 * @returns {Date} O objeto Date validado em UTC.
 * @throws {ValidationError} Se o formato da data for inválido ou a data não for futura.
 */
const validateAndParseDate = (dateString) => {
    const parsedDate = parse(dateString, 'dd/MM/yyyy HH:mm', new Date(), { locale: ptBR });

    if (!isValid(parsedDate)) {
        throw new ValidationError('Formato de data inválido (esperado: dd/MM/yyyy HH:mm)');
    }

    // Convert date from app timezone to UTC before comparison and saving
    const dateInAppTimezone = zonedTimeToUtc(parsedDate, APP_TIMEZONE);

    // Ensure comparison is consistent (current time in app timezone)
    //const nowInAppTimezone = zonedTimeToUtc(new Date(), APP_TIMEZONE);

    if (!isFuture(dateInAppTimezone)) { // Use isFuture from date-fns
        throw new ValidationError('Data deve ser futura');
    }

    // Retorna a data no formato UTC para armazenamento no banco
    return dateInAppTimezone;
};

/**
 * Formata um objeto Date (UTC) para a string dd/MM/yyyy HH:mm no fuso horário da aplicação.
 * @param {Date} dateObj O objeto Date em UTC.
 * @returns {string} A data formatada.
 */
const formatUtcDateToLocalString = (dateObj) => {
    const zonedDate = utcToZonedTime(dateObj, APP_TIMEZONE);
    return format(zonedDate, 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

const createAppointment = async (data) => {
    // 1. Validação do formato da data e se é futura
    const appointmentDateUtc = validateAndParseDate(data.date);

    // 2. Validação dos IDs e roles
    const doctor = await User.findByPk(data.doctorId);
    if (!doctor || doctor.role !== 'doctor') {
        throw new NotFoundError('Médico não encontrado');
    }

    const patient = await Patient.findByPk(data.patientId);
    if (!patient) {
        throw new NotFoundError('Paciente não encontrado');
    }

    // 3. Checar conflitos de agendamento (dentro da mesma hora)
    // Pega o início da hora do agendamento
    const startOfAppointmentHour = startOfHour(appointmentDateUtc);
    // Pega o fim da hora do agendamento (59 minutos e 59 segundos do mesmo início de hora)
    const endOfAppointmentHour = addHours(startOfAppointmentHour, 1);

    const existingAppointment = await Appointment.findOne({
        where: {
            doctorId: data.doctorId,
            date: {
                [Op.between]: [startOfAppointmentHour, endOfAppointmentHour],
            },
        },
    });

    if (existingAppointment) {
        throw new ValidationError('Médico já está agendado neste horário');
    }

    const appointment = await Appointment.create({
        id: uuidv4(),
        doctorId: data.doctorId,
        patientId: data.patientId,
        date: appointmentDateUtc, // Salva a data em UTC
        type: data.type,
        insurance: data.insurance,
    });

    await sendAppointmentConfirmation(patient.email, doctor.name, formatUtcDateToLocalString(appointment.date));

    // Retorna a data no formato de string local para a API
    return {
        ...appointment.toJSON(),
        date: formatUtcDateToLocalString(appointment.date),
        doctor: { id: doctor.id, name: doctor.name },
        patient: { id: patient.id, name: patient.name },
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

    const appointments = await Appointment.findAll({
        where,
        include: [
            { model: User, as: 'doctor', attributes: ['id', 'name'] },
            { model: Patient, as: 'patient', attributes: ['id', 'name'] },
        ],
    });

    return appointments.map(appointment => ({
        ...appointment.toJSON(),
        date: formatUtcDateToLocalString(appointment.date), // Formata para a string local
    }));
};

const getAppointmentById = async (id) => {
    const appointment = await Appointment.findByPk(id, {
        include: [
            { model: User, as: 'doctor', attributes: ['id', 'name'] },
            { model: Patient, as: 'patient', attributes: ['id', 'name'] },
        ],
    });

    if (!appointment) {
        throw new NotFoundError('Consulta não encontrada');
    }

    return {
        ...appointment.toJSON(),
        date: formatUtcDateToLocalString(appointment.date), // Formata para a string local
    };
};

const updateAppointment = async (id, data) => {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
        throw new NotFoundError('Consulta não encontrada');
    }

    let updatedDateUtc = appointment.date; // Mantém a data original se não for fornecida
    if (data.date) {
        updatedDateUtc = validateAndParseDate(data.date); // Reutiliza a validação
    }

    // Validações de ID de médico e paciente se forem passados nos dados
    if (data.doctorId) {
        const doctor = await User.findByPk(data.doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            throw new NotFoundError('Médico não encontrado');
        }
    }
    if (data.patientId) {
        const patient = await Patient.findByPk(data.patientId);
        if (!patient) {
            throw new NotFoundError('Paciente não encontrado');
        }
    }

    // Checar conflitos de agendamento APENAS se a data ou o médico foram alterados
    if (data.date || data.doctorId) {
        const doctorIdToCheck = data.doctorId || appointment.doctorId; // Usa o novo ou o existente
        const dateToCheck = updatedDateUtc;

        const startOfAppointmentHour = startOfHour(dateToCheck);
        const endOfAppointmentHour = addHours(startOfAppointmentHour, 1);

        const existingConflict = await Appointment.findOne({
            where: {
                doctorId: doctorIdToCheck,
                date: {
                    [Op.between]: [startOfAppointmentHour, endOfAppointmentHour],
                },
                id: {
                    [Op.ne]: id, // Exclui o próprio agendamento que está sendo atualizado
                },
            },
        });

        if (existingConflict) {
            throw new ValidationError('Médico já está agendado neste horário');
        }
    }

    await appointment.update({
        ...data,
        date: updatedDateUtc, // Passa a data em UTC para o update
    });

    // Recarregar para incluir associações atualizadas se necessário ou apenas retornar os dados atualizados
    // Aqui vamos retornar os dados formatados do objeto atualizado
    const updatedAppointment = await Appointment.findByPk(id, {
        include: [
            { model: User, as: 'doctor', attributes: ['id', 'name'] },
            { model: Patient, as: 'patient', attributes: ['id', 'name'] },
        ],
    });

    return {
        ...updatedAppointment.toJSON(),
        date: formatUtcDateToLocalString(updatedAppointment.date), // Formata para a string local
    };
};

const deleteAppointment = async (id) => {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
        throw new NotFoundError('Consulta não encontrada');
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