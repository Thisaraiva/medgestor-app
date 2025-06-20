const { createPrescription, getPrescriptionsByPatient } = require('../../services/prescriptionService');
const { Prescription, Patient, User } = require('../../models');
jest.mock('../../models');

describe('Prescription Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new prescription', async () => {
    const data = {
      patientId: 'uuid-patient',
      medication: 'Ibuprofen',
      dosage: '500 mg',
      frequency: 'A cada 8 horas',
      duration: 'Por 5 dias',
      dateIssued: new Date().toISOString(),
    };
    const doctorId = 'uuid-doctor';
    Patient.findByPk.mockResolvedValue({ id: 'uuid-patient' });
    User.findByPk.mockResolvedValue({ id: 'uuid-doctor', role: 'doctor' });
    Prescription.create.mockResolvedValue({ ...data, doctorId });
    const result = await createPrescription(data, doctorId);
    expect(result).toEqual({ ...data, doctorId });
  });

  it('should throw error for invalid patient', async () => {
    const data = {
      patientId: 'uuid-patient',
      medication: 'Ibuprofen',
      dosage: '500 mg',
      frequency: 'A cada 8 horas',
      duration: 'Por 5 dias',
      dateIssued: new Date().toISOString(),
    };
    Patient.findByPk.mockResolvedValue(null);
    await expect(createPrescription(data, 'uuid-doctor')).rejects.toThrow('Paciente não encontrado');
  });

  it('should get prescriptions by patient', async () => {
    const patientId = 'uuid-patient';
    Patient.findByPk.mockResolvedValue({ id: 'uuid-patient' });
    Prescription.findAll.mockResolvedValue([{ id: 'uuid-prescription', patientId }]);
    const result = await getPrescriptionsByPatient(patientId, {});
    expect(result).toHaveLength(1);
    expect(result[0].patientId).toBe(patientId);
  });
});