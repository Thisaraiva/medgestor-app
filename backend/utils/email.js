const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAppointmentConfirmation = async ({ to, patientName, doctorName, date }) => {
  const mailOptions = {
    from: `"MedGestor" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Confirmação de Consulta - MedGestor',
    text: `Olá ${patientName},\n\nSua consulta com o Dr. ${doctorName} foi agendada para ${date}.\n\nAtenciosamente,\nEquipe MedGestor`,
    html: `
      <h2>Confirmação de Consulta</h2>
      <p>Olá <strong>${patientName}</strong>,</p>
      <p>Sua consulta com o Dr. <em>${doctorName}</em> foi agendada para <strong>${date}</strong>.</p>
      <p>Atenciosamente,<br />Equipe MedGestor</p>
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