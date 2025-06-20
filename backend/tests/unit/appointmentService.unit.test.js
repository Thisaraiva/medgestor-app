const { createAppointment, getAppointments } = require('../../services/appointmentService');
const { Appointment, User, Patient } = require('../../models');
jest.mock('../../models');

describe('Appointment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new appointment', async () => {
    const data = {
      doctorId: 'uuid-doctor',
      patientId: 'uuid-patient',
      date: new Date(Date.now() + 86400000).toISOString(),
      type: 'initial',
      insurance: false,
    };
    User.findByPk.mockResolvedValue({ id: 'uuid-doctor', role: 'doctor' });
    Patient.findByPk.mockResolvedValue({ id: 'uuid-patient' });
    Appointment.findOne.mockResolvedValue(null);
    Appointment.create.mockResolvedValue(data);
    const result = await createAppointment(data);
    expect(result).toEqual(data);
  });

  it('should throw error for invalid doctor', async () => {
    const data = {
      doctorId: 'uuid-doctor',
      patientId: 'uuid-patient',
      date: new Date(Date.now() + 86400000).toISOString(),
      type: 'initial',
      insurance: false,
    };
    User.findByPk.mockResolvedValue(null);
    await expect(createAppointment(data)).rejects.toThrow('Doctor not found');
  });

  it('should throw error for conflicting appointment', async () => {
    const data = {
      doctorId: 'uuid-doctor',
      patientId: 'uuid-patient',
      date: new Date(Date.now() + 86400000).toISOString(),
      type: 'initial',
      insurance: false,
    };
    User.findByPk.mockResolvedValue({ id: 'uuid-doctor', role: 'doctor' });
    Patient.findByPk.mockResolvedValue({ id: 'uuid-patient' });
    Appointment.findOne.mockResolvedValue({ id: 'uuid-conflict' });
    await expect(createAppointment(data)).rejects.toThrow('Doctor is already booked at this time');
  });

  it('should get appointments with filters', async () => {
    const filters = { type: 'initial' };
    Appointment.findAll.mockResolvedValue([{ id: 'uuid-appointment', type: 'initial' }]);
    const result = await getAppointments(filters);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('initial');
  });
});