// Arquivo: C:\Programacao\Projetos\JavaScript\medgestor-app\backend\services\appointmentService.js

const { Appointment, User, Patient, InsurancePlan } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');
const { sendAppointmentConfirmation } = require('../utils/email'); // Manter comentado por enquanto
const moment = require('moment-timezone'); // Usando moment-timezone
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Carrega o locale pt-br para Moment.js
require('moment/locale/pt-br'); 

// Define o fuso horário da aplicação. É crucial que este seja consistente.
const APP_TIMEZONE = 'America/Sao_Paulo'; 

/**
 * Valida o formato da data ISO 8601 e se ela é futura.
 * A data de entrada é esperada como uma string ISO 8601 (ex: "2025-07-10T10:30:00.000Z" ou "2025-07-10T07:30:00-03:00").
 * O objetivo é converter para um objeto Moment que represente o tempo em UTC para armazenamento.
 * @param {string} isoDateString A string da data no formato ISO 8601.
 * @returns {moment.Moment} O objeto Moment validado em UTC.
 * @throws {ValidationError} Se o formato da data for inválido ou a data não for futura.
 */
const validateAndParseIsoDate = (isoDateString) => {
    // moment.utc(isoDateString) parseia a string ISO 8601 diretamente para um objeto Moment em UTC.
    const parsedMoment = moment.utc(isoDateString);

    if (!parsedMoment.isValid()) {
        throw new ValidationError('Formato de data e hora inválido (esperado: ISO 8601).');
    }

    // Para verificar se é futuro no fuso horário da aplicação, convertemos para esse fuso horário
    const dateInAppTimezone = parsedMoment.tz(APP_TIMEZONE);

    if (dateInAppTimezone.isBefore(moment().tz(APP_TIMEZONE))) { // Verifica se a data é anterior ao momento atual no fuso horário da aplicação
        throw new ValidationError('A data e hora da consulta devem ser futuras.');
    }

    // Retorna o objeto Moment em UTC. O Sequelize irá armazená-lo corretamente.
    return parsedMoment;
};

/**
 * Formata um objeto Date (que o Sequelize retorna em UTC) para uma string legível
 * no fuso horário da aplicação (dd/MM/yyyy HH:mm).
 * @param {Date} dateObj O objeto Date em UTC (vindo do banco de dados).
 * @returns {string} A data formatada na string local.
 */
const formatUtcDateToLocalString = (dateObj) => {
    // Cria um objeto Moment a partir do Date UTC e o converte para o fuso horário da aplicação
    return moment.utc(dateObj).tz(APP_TIMEZONE).format('DD/MM/YYYY HH:mm');
};

/**
 * Formata um objeto Date (que o Sequelize retorna em UTC) para uma string de data (YYYY-MM-DD)
 * no fuso horário da aplicação.
 * @param {Date} dateObj O objeto Date em UTC.
 * @returns {string} A data formatada como "YYYY-MM-DD".
 */
const formatUtcDateToLocalDateInput = (dateObj) => {
    return moment.utc(dateObj).tz(APP_TIMEZONE).format('YYYY-MM-DD');
};

/**
 * Formata um objeto Date (que o Sequelize retorna em UTC) para uma string de hora (HH:mm)
 * no fuso horário da aplicação.
 * @param {Date} dateObj O objeto Date em UTC.
 * @returns {string} A hora formatada como "HH:mm".
 */
const formatUtcDateToLocalTimeInput = (dateObj) => {
    return moment.utc(dateObj).tz(APP_TIMEZONE).format('HH:mm');
};


const createAppointment = async (data) => {
    // 1. Validação do formato da data e se é futura
    // A data agora é esperada em ISO 8601 do frontend e validateAndParseIsoDate a converte para Moment (UTC)
    const appointmentDateMomentUtc = validateAndParseIsoDate(data.date);

    // 2. Validação dos IDs e roles
    const doctor = await User.findByPk(data.doctorId);
    if (!doctor || doctor.role !== 'doctor') {
        throw new NotFoundError('Médico não encontrado ou não é um médico válido.');
    }

    const patient = await Patient.findByPk(data.patientId);
    if (!patient) {
        throw new NotFoundError('Paciente não encontrado.');
    }

    // 3. Validação do Plano de Saúde, se fornecido
    if (data.insurance && !data.insurancePlanId) {
        throw new ValidationError('O ID do plano de saúde é obrigatório quando a consulta é por convênio.');
    }
    if (data.insurancePlanId) {
        const insurancePlan = await InsurancePlan.findByPk(data.insurancePlanId);
        if (!insurancePlan) {
            throw new NotFoundError('Plano de saúde não encontrado.');
        }
    }

    // 4. Checar conflitos de agendamento (dentro da mesma hora)
    // startOf('hour') e add(1, 'hour') são métodos do Moment
    const startOfAppointmentHour = appointmentDateMomentUtc.clone().startOf('hour');
    const endOfAppointmentHour = appointmentDateMomentUtc.clone().add(1, 'hour').startOf('hour'); // Garante que a comparação seja no início da próxima hora

    const existingAppointment = await Appointment.findOne({
        where: {
            doctorId: data.doctorId,
            date: {
                [Op.between]: [startOfAppointmentHour.toDate(), endOfAppointmentHour.toDate()], // Converte Moment para Date para o Sequelize
            },
        },
    });

    if (existingAppointment) {
        throw new ValidationError('Médico já possui um agendamento neste horário.');
    }

    const appointment = await Appointment.create({
        id: uuidv4(),
        doctorId: data.doctorId,
        patientId: data.patientId,
        date: appointmentDateMomentUtc.toDate(), // Salva a data em UTC (objeto Date)
        type: data.type,
        insurance: data.insurance,
        insurancePlanId: data.insurance ? data.insurancePlanId : null, // Salva o ID do plano se for convênio
    });

    // Buscar informações completas para o email de confirmação e retorno da API
    const createdAppointmentWithDetails = await Appointment.findByPk(appointment.id, {
        include: [
            { model: User, as: 'doctor', attributes: ['id', 'name'] },
            { model: Patient, as: 'patient', attributes: ['id', 'name', 'email'] }, // Inclui email do paciente
            { model: InsurancePlan, as: 'insurancePlan', attributes: ['id', 'name'] }, // Inclui nome do plano
        ],
    });

    // Envio de e-mail de confirmação (descomentar quando o serviço de e-mail estiver pronto)
    if (createdAppointmentWithDetails.patient?.email) {
      await sendAppointmentConfirmation({
        to: createdAppointmentWithDetails.patient.email,
        patientName: createdAppointmentWithDetails.patient.name,
        doctorName: createdAppointmentWithDetails.doctor.name,
        date: formatUtcDateToLocalString(createdAppointmentWithDetails.date),
        insuranceInfo: createdAppointmentWithDetails.insurance ? createdAppointmentWithDetails.insurancePlan?.name : 'Particular'
      });
    }

    // Retorna a data no formato de string local para a API
    return {
        ...createdAppointmentWithDetails.toJSON(),
        date: formatUtcDateToLocalString(createdAppointmentWithDetails.date),
        dateOnly: formatUtcDateToLocalDateInput(createdAppointmentWithDetails.date),
        timeOnly: formatUtcDateToLocalTimeInput(createdAppointmentWithDetails.date),
        doctor: { id: createdAppointmentWithDetails.doctor.id, name: createdAppointmentWithDetails.doctor.name },
        patient: { id: createdAppointmentWithDetails.patient.id, name: createdAppointmentWithDetails.patient.name },
        insurancePlan: createdAppointmentWithDetails.insurancePlan ? { id: createdAppointmentWithDetails.insurancePlan.id, name: createdAppointmentWithDetails.insurancePlan.name } : null,
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
    // Adicionar filtros de data se presentes
    if (filters.startDate && filters.endDate) {
        const start = moment.utc(filters.startDate);
        const end = moment.utc(filters.endDate);
        if (start.isValid() && end.isValid()) {
            where.date = {
                [Op.between]: [start.toDate(), end.toDate()],
            };
        }
    } else if (filters.startDate) {
        const start = moment.utc(filters.startDate);
        if (start.isValid()) {
            where.date = {
                [Op.gte]: start.toDate(),
            };
        }
    } else if (filters.endDate) {
        const end = moment.utc(filters.endDate);
        if (end.isValid()) {
            where.date = {
                [Op.lte]: end.toDate(),
            };
        }
    }


    const appointments = await Appointment.findAll({
        where,
        include: [
            { model: User, as: 'doctor', attributes: ['id', 'name'] },
            { model: Patient, as: 'patient', attributes: ['id', 'name'] },
            { model: InsurancePlan, as: 'insurancePlan', attributes: ['id', 'name'] },
        ],
        order: [['date', 'ASC']], // Ordenar por data
    });

    return appointments.map(appointment => ({
        ...appointment.toJSON(),
        // Retorna a data formatada para o frontend
        date: formatUtcDateToLocalString(appointment.date),
        // Adiciona as datas separadas para facilitar o preenchimento no frontend
        dateOnly: formatUtcDateToLocalDateInput(appointment.date),
        timeOnly: formatUtcDateToLocalTimeInput(appointment.date),
        insurancePlan: appointment.insurancePlan ? { id: appointment.insurancePlan.id, name: appointment.insurancePlan.name } : null,
    }));
};

const getAppointmentById = async (id) => {
    const appointment = await Appointment.findByPk(id, {
        include: [
            { model: User, as: 'doctor', attributes: ['id', 'name'] },
            { model: Patient, as: 'patient', attributes: ['id', 'name'] },
            { model: InsurancePlan, as: 'insurancePlan', attributes: ['id', 'name'] },
        ],
    });

    if (!appointment) {
        throw new NotFoundError('Consulta não encontrada.');
    }

    return {
        ...appointment.toJSON(),
        // Retorna a data formatada para o frontend
        date: formatUtcDateToLocalString(appointment.date),
        // Adiciona as datas separadas para facilitar o preenchimento no frontend
        dateOnly: formatUtcDateToLocalDateInput(appointment.date),
        timeOnly: formatUtcDateToLocalTimeInput(appointment.date),
        insurancePlan: appointment.insurancePlan ? { id: appointment.insurancePlan.id, name: appointment.insurancePlan.name } : null,
    };
};

const updateAppointment = async (id, data) => {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
        throw new NotFoundError('Consulta não encontrada.');
    }

    let updatedDateMomentUtc = moment.utc(appointment.date); // Cria Moment a partir do Date UTC existente
    if (data.date) {
        updatedDateMomentUtc = validateAndParseIsoDate(data.date); // Reutiliza a validação para ISO 8601
    }

    // Validações de ID de médico e paciente se forem passados nos dados
    if (data.doctorId) {
        const doctor = await User.findByPk(data.doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            throw new NotFoundError('Médico não encontrado ou não é um médico válido.');
        }
    }
    if (data.patientId) {
        const patient = await Patient.findByPk(data.patientId);
        if (!patient) {
            throw new NotFoundError('Paciente não encontrado.');
        }
    }

    // Validação do Plano de Saúde na atualização
    if (data.insurance !== undefined) { // Se o campo insurance for explicitamente passado
      if (data.insurance && !data.insurancePlanId) {
        throw new ValidationError('O ID do plano de saúde é obrigatório quando a consulta é por convênio.');
      }
      if (!data.insurance && data.insurancePlanId) {
        // Se insurance for false, mas insurancePlanId foi enviado, limpa-o
        data.insurancePlanId = null;
      }
    } else if (data.insurancePlanId) { // Se insurance não foi passado, mas insurancePlanId foi
      const insurancePlan = await InsurancePlan.findByPk(data.insurancePlanId);
      if (!insurancePlan) {
        throw new NotFoundError('Plano de saúde não encontrado.');
      }
    }


    // Checar conflitos de agendamento APENAS se a data ou o médico foram alterados
    if (data.date || data.doctorId) {
        const doctorIdToCheck = data.doctorId || appointment.doctorId; // Usa o novo ou o existente
        const dateToCheckMoment = updatedDateMomentUtc; // Já é um objeto Moment (UTC)

        const startOfAppointmentHour = dateToCheckMoment.clone().startOf('hour');
        const endOfAppointmentHour = dateToCheckMoment.clone().add(1, 'hour').startOf('hour');

        const existingConflict = await Appointment.findOne({
            where: {
                doctorId: doctorIdToCheck,
                date: {
                    [Op.between]: [startOfAppointmentHour.toDate(), endOfAppointmentHour.toDate()], // Converte Moment para Date para o Sequelize
                },
                id: {
                    [Op.ne]: id, // Exclui o próprio agendamento que está sendo atualizado
                },
            },
        });

        if (existingConflict) {
            throw new ValidationError('Médico já possui um agendamento neste horário.');
        }
    }

    await appointment.update({
        ...data,
        date: updatedDateMomentUtc.toDate(), // Passa a data em UTC (objeto Date) para o update
        insurancePlanId: data.insurance !== undefined ? (data.insurance ? data.insurancePlanId : null) : appointment.insurancePlanId, // Atualiza o plano de saúde
    });

    // Recarregar para incluir associações atualizadas se necessário ou apenas retornar os dados atualizados
    const updatedAppointment = await Appointment.findByPk(id, {
        include: [
            { model: User, as: 'doctor', attributes: ['id', 'name'] },
            { model: Patient, as: 'patient', attributes: ['id', 'name'] },
            { model: InsurancePlan, as: 'insurancePlan', attributes: ['id', 'name'] },
        ],
    });

    return {
        ...updatedAppointment.toJSON(),
        date: formatUtcDateToLocalString(updatedAppointment.date), // Formata para a string local
        dateOnly: formatUtcDateToLocalDateInput(updatedAppointment.date),
        timeOnly: formatUtcDateToLocalTimeInput(updatedAppointment.date),
        insurancePlan: updatedAppointment.insurancePlan ? { id: updatedAppointment.insurancePlan.id, name: updatedAppointment.insurancePlan.name } : null,
    };
};

const deleteAppointment = async (id) => {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
        throw new NotFoundError('Consulta não encontrada.');
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
