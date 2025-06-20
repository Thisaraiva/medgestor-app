const { createPatient, getPatients } = require('../../services/patientService');
const { Patient } = require('../../models');
jest.mock('../../models');

describe('Patient Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new patient', async () => {
    const data = {
      name: 'Test Patient',
      cpf: '111.222.333-44',
      email: 'test.patient@example.com',
      phone: '(11) 91234-5678',
    };
    Patient.findOne.mockResolvedValue(null);
    Patient.create.mockResolvedValue(data);
    const result = await createPatient(data);
    expect(result).toEqual(data);
  });

  it('should throw error for duplicate CPF', async () => {
    const data = {
      name: 'Test Patient',
      cpf: '111.222.333-44',
      email: 'test.patient@example.com',
      phone: '(11) 91234-5678',
    };
    Patient.findOne.mockResolvedValue({ id: 'uuid-patient' });
    await expect(createPatient(data)).rejects.toThrow('CPF já registrado');
  });

  it('should get patients with filters', async () => {
    const filters = { cpf: '111.222.333-44' };
    Patient.findAll.mockResolvedValue([{ id: 'uuid-patient', cpf: '111.222.333-44' }]);
    const result = await getPatients(filters);
    expect(result).toHaveLength(1);
    expect(result[0].cpf).toBe('111.222.333-44');
  });
});