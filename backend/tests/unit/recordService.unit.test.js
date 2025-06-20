const { createRecord, getRecordsByPatient, getRecordById } = require('../../services/recordService');
const { MedicalRecord, Patient } = require('../../models');
jest.mock('../../models');

describe('Record Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new record', async () => {
    const data = {
      patientId: 'uuid-patient',
      diagnosis: 'Gripe',
      treatment: 'Repouso e hidratação',
      notes: 'Monitorar febre',
      date: new Date().toISOString(),
    };
    Patient.findByPk.mockResolvedValue({ id: 'uuid-patient' });
    MedicalRecord.create.mockResolvedValue(data);
    const result = await createRecord(data);
    expect(result).toEqual(data);
  });

  it('should throw error for invalid patient', async () => {
    const data = {
      patientId: 'uuid-patient',
      diagnosis: 'Gripe',
      treatment: 'Repouso e hidratação',
      notes: 'Monitorar febre',
      date: new Date().toISOString(),
    };
    Patient.findByPk.mockResolvedValue(null);
    await expect(createRecord(data)).rejects.toThrow('Paciente não encontrado');
  });

  it('should get records by patient', async () => {
    const patientId = 'uuid-patient';
    Patient.findByPk.mockResolvedValue({ id: 'uuid-patient' });
    MedicalRecord.findAll.mockResolvedValue([{ id: 'uuid-record', patientId }]);
    const result = await getRecordsByPatient(patientId, {});
    expect(result).toHaveLength(1);
    expect(result[0].patientId).toBe(patientId);
  });

  it('should get record by id', async () => {
    const recordId = 'uuid-record';
    Patient.findByPk.mockResolvedValue({ id: 'uuid-patient' });
    MedicalRecord.findByPk.mockResolvedValue({ id: recordId, patientId: 'uuid-patient' });
    const result = await getRecordById(recordId);
    expect(result.id).toBe(recordId);
  });
});