const nodemailer = require('nodemailer');
const { sendAppointmentConfirmation } = require('../../utils/email');

jest.mock('nodemailer');

describe('Email Utility Unit Tests', () => {
  let mockTransporter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: '123' }),
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);
  });

  it('should send appointment confirmation email successfully', async () => {
    const data = {
      to: 'patient@example.com',
      patientName: 'John Doe',
      doctorName: 'Dr. Smith',
      date: '01/07/2025 10:00',
    };

    await sendAppointmentConfirmation(data);
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: data.to,
        subject: 'Confirmação de Consulta - MedGestor',
        text: expect.stringContaining(data.patientName),
        html: expect.stringContaining(data.doctorName),
      })
    );
  });

  it('should throw error when email sending fails', async () => {
    const data = {
      to: 'patient@example.com',
      patientName: 'John Doe',
      doctorName: 'Dr. Smith',
      date: '01/07/2025 10:00',
    };

    mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));
    await expect(sendAppointmentConfirmation(data)).rejects.toThrow('Falha ao enviar email de confirmação');
  });
});