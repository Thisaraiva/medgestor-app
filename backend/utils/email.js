/*const nodemailer = require('nodemailer');
require('dotenv').config(); // Garante que as variáveis de ambiente sejam carregadas

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10), // Garante que a porta seja um número
  secure: process.env.EMAIL_SECURE === 'true', // Converte para booleano
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Adicione esta opção para ver mais detalhes em caso de problemas de conexão
  // debug: process.env.NODE_ENV === 'development', 
  // logger: process.env.NODE_ENV === 'development',
});

const sendAppointmentConfirmation = async ({ to, patientName, doctorName, date, insuranceInfo = 'Não informado' }) => {
  const mailOptions = {
    from: `"MedGestor" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Confirmação de Consulta - MedGestor',
    text: `Olá ${patientName},\n\nSua consulta com o Dr. ${doctorName} foi agendada para ${date}.` +
          `\nTipo de atendimento: ${insuranceInfo}.\n\nAtenciosamente,\nEquipe MedGestor`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #1a73e8;">Confirmação de Consulta - MedGestor</h2>
        <p>Olá <strong>${patientName}</strong>,</p>
        <p>Sua consulta com o Dr. <em>${doctorName}</em> foi agendada para <strong>${date}</strong>.</p>
        <p><strong>Tipo de atendimento:</strong> ${insuranceInfo}</p>
        <p>Aguardamos você!</p>
        <p>Atenciosamente,<br />Equipe MedGestor</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 0.8em; color: #999;">Este é um e-mail automático, por favor, não responda.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de confirmação enviado para ${to}`);
  } catch (error) {
    console.error('Erro ao enviar email de confirmação:', error);
    // Em produção, você pode querer logar isso em um sistema de logs ou usar um serviço de fila
    // para tentar novamente. Por enquanto, apenas logamos o erro.
    // throw new Error('Falha ao enviar email de confirmação'); // Não lançar erro para não bloquear a criação da consulta
  }
};

module.exports = { sendAppointmentConfirmation };
*/