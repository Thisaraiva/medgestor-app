const nodemailer = require('nodemailer');
     require('dotenv').config();

     const transporter = nodemailer.createTransport({
       service: 'gmail',
       auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASS,
       },
     });

     const sendAppointmentConfirmation = async (to, appointmentDetails) => {
       const mailOptions = {
         from: process.env.EMAIL_USER,
         to,
         subject: 'Confirmação de Consulta - MedGestor',
         text: `Sua consulta foi agendada para ${appointmentDetails.date} com o Dr. ${appointmentDetails.doctorName}. Por favor, confirme sua presença.`,
       };

       await transporter.sendMail(mailOptions);
     };

     module.exports = { sendAppointmentConfirmation };