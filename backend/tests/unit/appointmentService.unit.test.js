// Arquivo: C:\Programacao\Projetos\JavaScript\medgestor-app\backend\tests\unit\appointmentService.unit.test.js

const { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment } = require('../../services/appointmentService');
const { NotFoundError, ValidationError } = require('../../errors/errors');
const { sendAppointmentConfirmation } = require('../../utils/email');

//const { v4: uuidv4 } = require('uuid');

// Mocks para date-fns e date-fns-tz.
// Definimos as funções mockadas como jest.fn() diretamente aqui.
jest.mock('date-fns', () => ({
    parse: jest.fn(),
    isValid: jest.fn(),
    isFuture: jest.fn(),
    format: jest.fn(),
    startOfHour: jest.fn(),
    addHours: jest.fn(),
    addDays: jest.fn(),
    ptBR: {}, // Mock para ptBR se for importado
}));

jest.mock('date-fns-tz', () => ({
    zonedTimeToUtc: jest.fn(),
    utcToZonedTime: jest.fn(),
}));

jest.mock('../../utils/email', () => ({
    sendAppointmentConfirmation: jest.fn(),
}));

// Mocka os modelos do Sequelize.
jest.mock('../../models', () => ({
    User: {
        findByPk: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    Patient: {
        findByPk: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    Appointment: {
        create: jest.fn(),
        findByPk: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        destroy: jest.fn(),
        update: jest.fn(),
    },
    Op: { // Opções do Sequelize para operadores de consulta
        between: Symbol('between'),
        ne: Symbol('ne'),
    }
}));

// Mock para UUID
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-uuid'),
}));

describe('Appointment Service Unit Tests', () => {
    let mockDoctor;
    let mockPatient;
    let mockAppointmentInstance;

    // Importa as funções mockadas dos módulos.
    // Usamos `jest.requireMock` para obter a referência real da função mockada que Jest criou.
    const { User, Patient, Appointment,  } = require('../../models');
    const { parse, isValid, isFuture, format, startOfHour, addHours, addDays } = require('date-fns');
    const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');


    beforeEach(() => {
        jest.clearAllMocks(); // Limpa todas as chamadas e instâncias dos mocks

        // Resetar as implementações dos mocks de date-fns e date-fns-tz para o estado padrão de fábrica
        parse.mockImplementation((dateString, _formatStr, _refDate) => {
            if (dateString === 'invalid-date') return new Date('invalid date');
            const [datePart, timePart] = dateString.split(' ');
            const [day, month, year] = datePart.split('/').map(Number);
            const [hours, minutes] = timePart.split(':').map(Number);
            return new Date(year, month - 1, day, hours, minutes);
        });
        isValid.mockImplementation((date) => date instanceof Date && !isNaN(date.getTime()));
        isFuture.mockImplementation((date) => date.getTime() > new Date().getTime());
        format.mockImplementation((date, _formatStr) => {
            if (!date || isNaN(date.getTime())) return 'Invalid Date';
            const d = new Date(date);
            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        });
        startOfHour.mockImplementation((date) => {
            const newDate = new Date(date);
            newDate.setMinutes(0, 0, 0);
            return newDate;
        });
        addHours.mockImplementation((date, hours) => {
            const newDate = new Date(date);
            newDate.setHours(date.getHours() + hours);
            return newDate;
        });
        addDays.mockImplementation((date, days) => {
            const d = new Date(date);
            d.setDate(d.getDate() + days);
            return d;
        });

        zonedTimeToUtc.mockImplementation((date) => new Date(date.getTime()));
        utcToZonedTime.mockImplementation((date) => new Date(date.getTime()));

        // Definição dos objetos mockados que representam instâncias do Sequelize
        mockDoctor = {
            id: 'doctor-uuid-123',
            name: 'Dr. Unit Test',
            email: 'doctor@test.com',
            role: 'doctor',
        };
        mockPatient = {
            id: 'patient-uuid-456',
            name: 'Patient Unit Test',
            email: 'patient@test.com',
        };
        mockAppointmentInstance = {
            id: 'appointment-uuid-789',
            doctorId: mockDoctor.id,
            patientId: mockPatient.id,
            date: new Date('2025-07-01T10:00:00Z'), // Exemplo de data UTC
            type: 'initial',
            insurance: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            toJSON: jest.fn(function() {
                return {
                    id: this.id,
                    doctorId: this.doctorId,
                    patientId: this.patientId,
                    date: this.date.toISOString(), // Simula o Sequelize retornando ISO string
                    type: this.type,
                    insurance: this.insurance,
                    doctor: this.doctor || { id: this.doctorId, name: 'Mock Doctor' },
                    patient: this.patient || { id: this.patientId, name: 'Mock Patient' },
                };
            }),
            update: jest.fn(async function(data) {
                Object.assign(this, data);
                if (data.date) this.date = data.date;
                return this;
            }),
            destroy: jest.fn(),
            doctor: mockDoctor,
            patient: mockPatient,
        };

        // Configura mocks padrão para os métodos dos modelos.
        User.findByPk.mockResolvedValue(mockDoctor);
        Patient.findByPk.mockResolvedValue(mockPatient);
        Appointment.create.mockResolvedValue(mockAppointmentInstance);
        Appointment.findByPk.mockResolvedValue(mockAppointmentInstance);
        Appointment.findOne.mockResolvedValue(null);
        Appointment.findAll.mockResolvedValue([mockAppointmentInstance]);
        sendAppointmentConfirmation.mockResolvedValue(true);
    });

    describe('createAppointment', () => {
        it('should create an appointment successfully', async () => {
            const appointmentDateString = '01/07/2025 10:00';
            const expectedUtcDate = new Date('2025-07-01T10:00:00Z');

            // Mocks específicos para este cenário de sucesso
            parse.mockReturnValueOnce(new Date(2025, 6, 1, 10, 0));
            isValid.mockReturnValueOnce(true);
            isFuture.mockReturnValueOnce(true);
            zonedTimeToUtc.mockReturnValueOnce(expectedUtcDate);
            utcToZonedTime.mockReturnValueOnce(new Date(2025, 6, 1, 10, 0));
            format.mockReturnValueOnce(appointmentDateString);

            Appointment.create.mockResolvedValueOnce({
                ...mockAppointmentInstance,
                id: 'new-appointment-id',
                date: expectedUtcDate,
                toJSON: jest.fn(function() {
                    return {
                        id: this.id,
                        doctorId: this.doctorId,
                        patientId: this.patientId,
                        date: this.date.toISOString(),
                        type: this.type,
                        insurance: this.insurance,
                        doctor: mockDoctor,
                        patient: mockPatient,
                    };
                }),
            });

            const mockData = {
                doctorId: mockDoctor.id,
                patientId: mockPatient.id,
                date: appointmentDateString,
                type: 'initial',
                insurance: true,
            };

            const result = await createAppointment(mockData);

            expect(User.findByPk).toHaveBeenCalledWith(mockDoctor.id);
            expect(Patient.findByPk).toHaveBeenCalledWith(mockPatient.id);
            expect(Appointment.findOne).toHaveBeenCalled();
            expect(Appointment.create).toHaveBeenCalledWith({
                id: 'mock-uuid',
                doctorId: mockDoctor.id,
                patientId: mockPatient.id,
                date: expectedUtcDate,
                type: 'initial',
                insurance: true,
            });
            expect(sendAppointmentConfirmation).toHaveBeenCalledWith(
                mockPatient.email,
                mockDoctor.name,
                appointmentDateString
            );
            expect(result).toHaveProperty('id', 'new-appointment-id');
            expect(result.date).toBe(appointmentDateString);
            expect(result.doctor).toEqual({ id: mockDoctor.id, name: mockDoctor.name });
            expect(result.patient).toEqual({ id: mockPatient.id, name: mockPatient.name });
        });

        it('should throw ValidationError for invalid date format', async () => {
            parse.mockReturnValueOnce(new Date('invalid date'));
            isValid.mockReturnValueOnce(false);

            const mockData = {
                doctorId: mockDoctor.id,
                patientId: mockPatient.id,
                date: 'invalid-date',
                type: 'initial',
                insurance: true,
            };

            await expect(createAppointment(mockData)).rejects.toThrow(new ValidationError('Formato de data inválido (esperado: dd/MM/yyyy HH:mm)'));
            expect(sendAppointmentConfirmation).not.toHaveBeenCalled();
            expect(User.findByPk).not.toHaveBeenCalled();
        });

        it('should throw ValidationError for past date', async () => {
            parse.mockReturnValueOnce(new Date(2020, 0, 1, 10, 0));
            isValid.mockReturnValueOnce(true);
            isFuture.mockReturnValueOnce(false);

            const mockData = {
                doctorId: mockDoctor.id,
                patientId: mockPatient.id,
                date: '01/01/2020 10:00',
                type: 'initial',
                insurance: true,
            };

            await expect(createAppointment(mockData)).rejects.toThrow(new ValidationError('Data deve ser futura'));
            expect(sendAppointmentConfirmation).not.toHaveBeenCalled();
            expect(User.findByPk).not.toHaveBeenCalled();
        });

        it('should throw NotFoundError for non-existent doctor', async () => {
            User.findByPk.mockResolvedValueOnce(null);

            const mockData = {
                doctorId: 'non-existent-doctor-id',
                patientId: mockPatient.id,
                date: '01/07/2025 10:00',
                type: 'initial',
                insurance: true,
            };

            await expect(createAppointment(mockData)).rejects.toThrow(new NotFoundError('Médico não encontrado'));
            expect(User.findByPk).toHaveBeenCalledWith('non-existent-doctor-id');
            expect(sendAppointmentConfirmation).not.toHaveBeenCalled();
        });

        it('should throw NotFoundError for non-doctor role', async () => {
            User.findByPk.mockResolvedValueOnce({ id: mockDoctor.id, role: 'secretary' });

            const mockData = {
                doctorId: mockDoctor.id,
                patientId: mockPatient.id,
                date: '01/07/2025 10:00',
                type: 'initial',
                insurance: true,
            };

            await expect(createAppointment(mockData)).rejects.toThrow(new NotFoundError('Médico não encontrado'));
            expect(User.findByPk).toHaveBeenCalledWith(mockDoctor.id);
            expect(sendAppointmentConfirmation).not.toHaveBeenCalled();
        });

        it('should throw NotFoundError for non-existent patient', async () => {
            Patient.findByPk.mockResolvedValueOnce(null);

            const mockData = {
                doctorId: mockDoctor.id,
                patientId: 'non-existent-patient-id',
                date: '01/07/2025 10:00',
                type: 'initial',
                insurance: true,
            };

            await expect(createAppointment(mockData)).rejects.toThrow(new NotFoundError('Paciente não encontrado'));
            expect(User.findByPk).toHaveBeenCalledWith(mockDoctor.id);
            expect(Patient.findByPk).toHaveBeenCalledWith('non-existent-patient-id');
            expect(sendAppointmentConfirmation).not.toHaveBeenCalled();
        });

        it('should throw ValidationError for conflicting appointment', async () => {
            const conflictDateString = '01/07/2025 10:00';
            const conflictDateUtc = new Date('2025-07-01T10:00:00Z');

            parse.mockReturnValueOnce(new Date(2025, 6, 1, 10, 0));
            isValid.mockReturnValueOnce(true);
            isFuture.mockReturnValueOnce(true);
            zonedTimeToUtc.mockReturnValueOnce(conflictDateUtc);
            startOfHour.mockReturnValueOnce(conflictDateUtc);
            addHours.mockReturnValueOnce(new Date(conflictDateUtc.getTime() + 3600000));

            Appointment.findOne.mockResolvedValueOnce({ id: 'some-existing-id', date: conflictDateUtc });

            const mockData = {
                doctorId: mockDoctor.id,
                patientId: mockPatient.id,
                date: conflictDateString,
                type: 'initial',
                insurance: true,
            };

            await expect(createAppointment(mockData)).rejects.toThrow(new ValidationError('Médico já está agendado neste horário'));
            expect(User.findByPk).toHaveBeenCalledWith(mockDoctor.id);
            expect(Patient.findByPk).toHaveBeenCalledWith(mockPatient.id);
            expect(Appointment.findOne).toHaveBeenCalled();
            expect(sendAppointmentConfirmation).not.toHaveBeenCalled();
        });
    });

    describe('getAppointments', () => {
        it('should return a list of appointments with filters', async () => {
            const appointmentDateUtc = new Date('2025-07-02T11:00:00Z');
            const appointmentDateString = '02/07/2025 11:00';

            const mockApptWithAssociations = {
                ...mockAppointmentInstance,
                id: 'appt-1',
                date: appointmentDateUtc,
                doctor: { id: mockDoctor.id, name: mockDoctor.name },
                patient: { id: mockPatient.id, name: mockPatient.name },
                toJSON: jest.fn(function() {
                    return {
                        id: this.id,
                        doctorId: this.doctorId,
                        patientId: this.patientId,
                        date: this.date.toISOString(),
                        type: this.type,
                        insurance: this.insurance,
                        doctor: this.doctor,
                        patient: this.patient,
                    };
                }),
            };
            Appointment.findAll.mockResolvedValueOnce([mockApptWithAssociations]);

            utcToZonedTime.mockReturnValueOnce(new Date(2025, 6, 2, 11, 0));
            format.mockReturnValueOnce(appointmentDateString);


            const result = await getAppointments({ type: 'initial', doctorId: mockDoctor.id });

            expect(Appointment.findAll).toHaveBeenCalledWith({
                where: { type: 'initial', doctorId: mockDoctor.id },
                include: [
                    { model: User, as: 'doctor', attributes: ['id', 'name'] },
                    { model: Patient, as: 'patient', attributes: ['id', 'name'] },
                ],
            });
            expect(result).toEqual([{
                id: 'appt-1',
                doctorId: mockDoctor.id,
                patientId: mockPatient.id,
                date: appointmentDateString,
                type: mockAppointmentInstance.type,
                insurance: mockAppointmentInstance.insurance,
                doctor: { id: mockDoctor.id, name: mockDoctor.name },
                patient: { id: mockPatient.id, name: mockPatient.name },
            }]);
        });

        it('should return an empty list when no appointments match', async () => {
            Appointment.findAll.mockResolvedValueOnce([]);
            const result = await getAppointments({ type: 'initial' });
            expect(result).toEqual([]);
        });
    });

    describe('getAppointmentById', () => {
        it('should return an appointment by ID', async () => {
            const appointmentDateUtc = new Date('2025-07-04T12:00:00Z');
            const appointmentDateString = '04/07/2025 12:00';

            const mockAppt = {
                ...mockAppointmentInstance,
                id: 'mock-appointment-id',
                date: appointmentDateUtc,
                doctor: { id: mockDoctor.id, name: mockDoctor.name },
                patient: { id: mockPatient.id, name: mockPatient.name },
                toJSON: jest.fn(function() {
                    return {
                        id: this.id,
                        doctorId: this.doctorId,
                        patientId: this.patientId,
                        date: this.date.toISOString(),
                        type: this.type,
                        insurance: this.insurance,
                        doctor: this.doctor,
                        patient: this.patient,
                    };
                }),
            };
            Appointment.findByPk.mockResolvedValueOnce(mockAppt);

            utcToZonedTime.mockReturnValueOnce(new Date(2025, 6, 4, 12, 0));
            format.mockReturnValueOnce(appointmentDateString);

            const result = await getAppointmentById('mock-appointment-id');

            expect(Appointment.findByPk).toHaveBeenCalledWith('mock-appointment-id', expect.any(Object));
            expect(result).toHaveProperty('id', 'mock-appointment-id');
            expect(result.date).toBe(appointmentDateString);
        });

        it('should throw NotFoundError for non-existent appointment', async () => {
            Appointment.findByPk.mockResolvedValueOnce(null);
            await expect(getAppointmentById('non-existent-id')).rejects.toThrow(new NotFoundError('Consulta não encontrada'));
        });
    });

    describe('updateAppointment', () => {
        let existingAppointmentInstance;

        beforeEach(() => {
            //const initialDateString = '05/07/2025 10:00';
            const initialDateUtc = new Date('2025-07-05T10:00:00Z');

            existingAppointmentInstance = {
                id: 'existing-appointment-id',
                doctorId: mockDoctor.id,
                patientId: mockPatient.id,
                date: initialDateUtc,
                type: 'initial',
                insurance: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                toJSON: jest.fn(function() {
                    return {
                        id: this.id,
                        doctorId: this.doctorId,
                        patientId: this.patientId,
                        date: this.date.toISOString(),
                        type: this.type,
                        insurance: this.insurance,
                    };
                }),
                update: jest.fn(async function(data) {
                    Object.assign(this, data);
                    if (data.date) this.date = data.date;
                    return this;
                }),
                doctor: mockDoctor,
                patient: mockPatient,
            };

            Appointment.findByPk.mockResolvedValue(existingAppointmentInstance);
            Appointment.findOne.mockResolvedValue(null);

            parse.mockImplementation((dateString, _formatStr) => {
                if (dateString === 'invalid-date') return new Date('invalid date');
                const [datePart, timePart] = dateString.split(' ');
                const [day, month, year] = datePart.split('/').map(Number);
                const [hours, minutes] = timePart.split(':').map(Number);
                return new Date(year, month - 1, day, hours, minutes);
            });
            isValid.mockReturnValue(true);
            isFuture.mockReturnValue(true);
            zonedTimeToUtc.mockImplementation((date) => new Date(date.getTime()));
            utcToZonedTime.mockImplementation((date) => new Date(date.getTime()));
            startOfHour.mockImplementation((date) => {
                const d = new Date(date);
                d.setMinutes(0, 0, 0);
                return d;
            });
            addHours.mockImplementation((date, hours) => {
                const d = new Date(date);
                d.setHours(d.getHours() + hours);
                return d;
            });
            format.mockImplementation((date, _formatStr) => {
                if (!date || isNaN(date.getTime())) return 'Invalid Date';
                const d = new Date(date);
                return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            });
        });

        it('should update an appointment successfully', async () => {
            const updatedDateString = '05/07/2025 11:00';
            const updatedParsedDate = new Date(2025, 6, 5, 11, 0);
            const updatedDateUtc = new Date('2025-07-05T11:00:00Z');

            parse.mockReturnValueOnce(updatedParsedDate);
            zonedTimeToUtc.mockReturnValueOnce(updatedDateUtc);
            utcToZonedTime.mockReturnValueOnce(updatedParsedDate);
            format.mockReturnValueOnce(updatedDateString);

            Appointment.findByPk.mockResolvedValueOnce(existingAppointmentInstance);
            Appointment.findByPk.mockResolvedValueOnce({
                ...existingAppointmentInstance,
                date: updatedDateUtc,
                type: 'return',
                insurance: true,
                toJSON: jest.fn(function() {
                     return {
                        id: this.id,
                        doctorId: this.doctorId,
                        patientId: this.patientId,
                        date: this.date.toISOString(),
                        type: this.type,
                        insurance: this.insurance,
                        doctor: mockDoctor,
                        patient: mockPatient,
                    };
                }),
            });

            const mockUpdateData = {
                type: 'return',
                date: updatedDateString,
                doctorId: mockDoctor.id,
                patientId: mockPatient.id,
                insurance: true,
            };

            const result = await updateAppointment(existingAppointmentInstance.id, mockUpdateData);

            expect(Appointment.findByPk).toHaveBeenCalledWith(existingAppointmentInstance.id);
            expect(existingAppointmentInstance.update).toHaveBeenCalledWith(expect.objectContaining({
                type: 'return',
                date: updatedDateUtc,
                doctorId: mockDoctor.id,
                patientId: mockPatient.id,
            }));
            expect(Appointment.findByPk).toHaveBeenCalledWith(existingAppointmentInstance.id, expect.any(Object));
            expect(result).toHaveProperty('id', existingAppointmentInstance.id);
            expect(result.type).toBe('return');
            expect(result.date).toBe(updatedDateString);
        });

        it('should throw NotFoundError for non-existent appointment during update', async () => {
            Appointment.findByPk.mockResolvedValueOnce(null);
            const mockUpdateData = { type: 'return' };

            await expect(updateAppointment('non-existent-id', mockUpdateData)).rejects.toThrow(new NotFoundError('Consulta não encontrada'));
        });

        it('should throw NotFoundError for non-existent doctor during update', async () => {
            User.findByPk.mockResolvedValueOnce(null);

            const mockUpdateData = {
                doctorId: 'non-existent-doctor-id',
            };

            await expect(updateAppointment(existingAppointmentInstance.id, mockUpdateData)).rejects.toThrow(new NotFoundError('Médico não encontrado'));
        });

        it('should throw NotFoundError for non-existent patient during update', async () => {
            User.findByPk.mockResolvedValueOnce(mockDoctor);
            Patient.findByPk.mockResolvedValueOnce(null);

            const mockUpdateData = {
                patientId: 'non-existent-patient-id',
            };

            await expect(updateAppointment(existingAppointmentInstance.id, mockUpdateData)).rejects.toThrow(new NotFoundError('Paciente não encontrado'));
        });

        it('should return 400 for invalid date format during update', async () => {
            parse.mockReturnValueOnce(new Date('invalid date'));
            isValid.mockReturnValueOnce(false);

            const mockUpdateData = {
                date: 'invalid-date',
            };

            await expect(updateAppointment(existingAppointmentInstance.id, mockUpdateData)).rejects.toThrow(new ValidationError('Formato de data inválido (esperado: dd/MM/yyyy HH:mm)'));
        });

        it('should throw ValidationError for conflicting appointment', async () => {
            const conflictDateString = '06/07/2025 10:00';
            const conflictDateUtc = new Date('2025-07-06T10:00:00Z');

            parse.mockReturnValueOnce(new Date(2025, 6, 6, 10, 0));
            isValid.mockReturnValueOnce(true);
            isFuture.mockReturnValueOnce(true);
            zonedTimeToUtc.mockReturnValueOnce(conflictDateUtc);
            startOfHour.mockReturnValueOnce(conflictDateUtc);
            addHours.mockReturnValueOnce(new Date(conflictDateUtc.getTime() + 3600000));

            Appointment.findByPk.mockResolvedValueOnce(existingAppointmentInstance);

            Appointment.findOne.mockResolvedValueOnce({
                id: 'another-appointment-id',
                doctorId: mockDoctor.id,
                date: conflictDateUtc,
            });

            const mockUpdateData = {
                date: conflictDateString,
                doctorId: mockDoctor.id,
                patientId: mockPatient.id,
            };

            await expect(updateAppointment(existingAppointmentInstance.id, mockUpdateData)).rejects.toThrow(new ValidationError('Médico já está agendado neste horário'));
            expect(Appointment.findOne).toHaveBeenCalled();
        });
    });

    describe('deleteAppointment', () => {
        it('should delete an appointment successfully', async () => {
            Appointment.findByPk.mockResolvedValueOnce(mockAppointmentInstance);
            mockAppointmentInstance.destroy.mockResolvedValueOnce(true);

            await deleteAppointment(mockAppointmentInstance.id);

            expect(Appointment.findByPk).toHaveBeenCalledWith(mockAppointmentInstance.id);
            expect(mockAppointmentInstance.destroy).toHaveBeenCalled();
        });

        it('should throw NotFoundError for non-existent appointment', async () => {
            Appointment.findByPk.mockResolvedValueOnce(null);
            await expect(deleteAppointment('non-existent-id')).rejects.toThrow(new NotFoundError('Consulta não encontrada'));
        });
    });
});
