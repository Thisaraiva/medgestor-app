const { createRecord, getRecordsByPatient, getRecordById } = require('../../services/recordService');
const { MedicalRecord, Patient } = require('../../models');
const { NotFoundError } = require('../../errors/errors'); // Importar NotFoundError e ValidationError
jest.mock('../../models');

describe('Record Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new record', async () => {
    const data = {
      patientId: 'uuid-patient-1',
      diagnosis: 'Gripe',
      treatment: 'Repouso e hidratação',
      notes: 'Monitorar febre',
      date: new Date().toISOString(), // Adicionado campo date
    };
    Patient.findByPk.mockResolvedValue({ id: 'uuid-patient-1' });
    MedicalRecord.create.mockResolvedValue(data);
    const result = await createRecord(data);
    expect(result).toEqual(data);
    expect(Patient.findByPk).toHaveBeenCalledWith(data.patientId);
    expect(MedicalRecord.create).toHaveBeenCalledWith(data);
  });

  it('should throw error for invalid patient when creating record', async () => {
    const data = {
      patientId: 'uuid-patient-invalid',
      diagnosis: 'Gripe',
      treatment: 'Repouso e hidratação',
      notes: 'Monitorar febre',
      date: new Date().toISOString(),
    };
    Patient.findByPk.mockResolvedValue(null); // Paciente não encontrado
    await expect(createRecord(data)).rejects.toThrow(NotFoundError); // Espera NotFoundError
    await expect(createRecord(data)).rejects.toThrow('Paciente não encontrado');
    expect(Patient.findByPk).toHaveBeenCalledWith(data.patientId);
    expect(MedicalRecord.create).not.toHaveBeenCalled();
  });

  it('should get records by patient', async () => {
    const patientId = 'uuid-patient-2';
    const mockRecords = [{ 
      id: 'uuid-record-1', 
      patientId: patientId,
      diagnosis: 'Dor de cabeça',
      treatment: 'Paracetamol',
      notes: 'Notas',
      date: new Date().toISOString(),
      Patient: { id: patientId, name: 'Test Patient' } // Incluir dados do paciente mockado
    }];
    Patient.findByPk.mockResolvedValue({ id: patientId }); // Paciente encontrado
    MedicalRecord.findAll.mockResolvedValue(mockRecords);
    
    const result = await getRecordsByPatient(patientId, {});
    expect(result).toHaveLength(1);
    expect(result[0].patientId).toBe(patientId);
    expect(MedicalRecord.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { patientId },
      include: [{ model: Patient, attributes: ['id', 'name'] }]
    }));
  });

  it('should throw NotFoundError if patient not found when getting records by patient', async () => {
    const patientId = 'uuid-patient-not-found';
    MedicalRecord.findAll.mockResolvedValue([]); // Nenhhum registro encontrado
    Patient.findByPk.mockResolvedValue(null); // Paciente também não encontrado
    
    await expect(getRecordsByPatient(patientId, {})).rejects.toThrow(NotFoundError);
    await expect(getRecordsByPatient(patientId, {})).rejects.toThrow('Paciente não encontrado');
    expect(MedicalRecord.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { patientId }
    }));
    expect(Patient.findByPk).toHaveBeenCalledWith(patientId);
  });

  it('should get record by id', async () => {
    const recordId = 'uuid-record-3';
    const mockRecord = { 
      id: recordId, 
      patientId: 'uuid-patient-3',
      diagnosis: 'Gripe',
      treatment: 'Repouso',
      notes: 'Notas',
      date: new Date().toISOString(),
      Patient: { id: 'uuid-patient-3', name: 'Another Patient' }
    };
    MedicalRecord.findByPk.mockResolvedValue(mockRecord);
    const result = await getRecordById(recordId);
    expect(result.id).toBe(recordId);
    expect(result.diagnosis).toBe('Gripe');
    expect(MedicalRecord.findByPk).toHaveBeenCalledWith(recordId, expect.objectContaining({
      include: [{ model: Patient, attributes: ['id', 'name'] }]
    }));
  });

  it('should throw NotFoundError if record not found by id', async () => {
    const recordId = 'uuid-record-not-found';
    MedicalRecord.findByPk.mockResolvedValue(null);
    await expect(getRecordById(recordId)).rejects.toThrow(NotFoundError);
    await expect(getRecordById(recordId)).rejects.toThrow('Registro médico não encontrado');
    expect(MedicalRecord.findByPk).toHaveBeenCalledWith(recordId, expect.objectContaining({
      include: [{ model: Patient, attributes: ['id', 'name'] }]
    }));
  });
});