const { Appointment, User, Patient } = require('../models');
   const { NotFoundError, ValidationError } = require('../errors/errors');

   const validateAppointment = ({ doctorId, patientId, date, type }) => {
     if (!Date.now() || new Date(date) <= new Date()) {
       throw new ValidationError('A data deve ser futura');
     }
     if (!['initial', 'return'].includes(type)) {
       throw new ValidationError('Tipo de consulta inválido');
     }
     if (!doctorId || !patientId) {
       throw new ValidationError('DoctorId e patientId são obrigatórios');
     }
   };

   const createAppointment = async ({ doctorId, patientId, date, type, insurance }) => {
     validateAppointment({ doctorId, patientId, date, type });
     const doctor = await User.findByPk(doctorId);
     const patient = await Patient.findByPk(patientId);
     if (!doctor || !patient) {
       throw new NotFoundError('Médico ou paciente não encontrado');
     }
     return Appointment.create({ doctorId, patientId, date, type, insurance });
   };

   const getAppointments = async ({ status, type, doctorId }) => {
     const where = {};
     if (status) {
       where.status = status;
     }
     if (type) {
       where.type = type;
     }
     if (doctorId) {
       where.doctorId = doctorId;
     }
     return Appointment.findAll({
       where,
       include: [
         { model: User, as: 'doctor', attributes: ['id', 'name'] },
         { model: Patient, as: 'patient', attributes: ['id', 'name'] },
       ],
     });
   };

   const getAppointmentById = async (id) => {
     const appointment = await Appointment.findByPk(id, {
       include: [
         { model: User, as: 'doctor', attributes: ['id', 'name'] },
         { model: Patient, as: 'patient', attributes: ['id', 'name'] },
       ],
     });
     if (!appointment) {
       throw new NotFoundError('Consulta não encontrada');
     }
     return appointment;
   };

   const updateAppointment = async (id, data) => {
     const appointment = await Appointment.findByPk(id);
     if (!appointment) {
       throw new NotFoundError('Consulta não encontrada');
     }
     if (data.date) {
       validateAppointment({ ...data, doctorId: appointment.doctorId, patientId: appointment.patientId });
     }
     return appointment.update(data);
   };

   const deleteAppointment = async (id) => {
     const appointment = await Appointment.findByPk(id);
     if (!appointment) {
       throw new NotFoundError('Consulta não encontrada');
     }
     await appointment.destroy();
   };

   module.exports = { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment };