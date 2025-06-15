const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.yahoo.com',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAppointmentConfirmation = async (to, { date, doctorName }) => {
  const mailOptions = {
    from: `"MedGestor" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Confirmação de Consulta - MedGestor',
    text: `Sua consulta foi agendada para ${new Date(date).toLocaleString()} com o Dr. ${doctorName}. Por favor, confirme sua presença.`,
    html: `
      <h2>Confirmação de Consulta</h2>
      <p>Olá,</p>
      <p>Sua consulta foi agendada para <strong>${new Date(date).toLocaleString()}</strong> com o Dr. <strong>${doctorName}</strong>.</p>
      <p>Por favor, confirme sua presença.</p>
      <p>Atenciosamente,<br/>Equipe MedGestor</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email enviado para ${to}`);
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new Error('Falha ao enviar email de confirmação');
  }
};

module.exports = { sendAppointmentConfirmation };