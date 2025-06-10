const { Appointment, User, Patient } = require('../models');

   const createAppointment = async (req, res) => {
     try {
       const { doctorId, patientId, date, type, insurance } = req.body;
       const appointment = await Appointment.create({ doctorId, patientId, date, type, insurance });
       res.status(201).json(appointment);
     } catch (error) {
       res.status(400).json({ error: error.message });
     }
   };

   const getAppointments = async (req, res) => {
     try {
       const appointments = await Appointment.findAll({
         include: [
           { model: User, as: 'doctor', attributes: ['id', 'name'] },
           { model: Patient, as: 'patient', attributes: ['id', 'name'] },
         ],
       });
       res.json(appointments);
     } catch (error) {
       res.status(400).json({ error: error.message });
     }
   };

   const getAppointmentById = async (req, res) => {
     try {
       const appointment = await Appointment.findByPk(req.params.id, {
         include: [
           { model: User, as: 'doctor', attributes: ['id', 'name'] },
           { model: Patient, as: 'patient', attributes: ['id', 'name'] },
         ],
       });
       if (!appointment) {
         return res.status(404).json({ error: 'Consulta não encontrada' });
       }
       res.json(appointment);
     } catch (error) {
       res.status(400).json({ error: error.message });
     }
   };

   const updateAppointment = async (req, res) => {
     try {
       const { date, type, insurance } = req.body;
       const appointment = await Appointment.findByPk(req.params.id);
       if (!appointment) {
         return res.status(404).json({ error: 'Consulta não encontrada' });
       }
       await appointment.update({ date, type, insurance });
       res.json(appointment);
     } catch (error) {
       res.status(400).json({ error: error.message });
     }
   };

   const deleteAppointment = async (req, res) => {
     try {
       const appointment = await Appointment.findByPk(req.params.id);
       if (!appointment) {
         return res.status(404).json({ error: 'Consulta não encontrada' });
       }
       await appointment.destroy();
       res.status(204).send();
     } catch (error) {
       res.status(400).json({ error: error.message });
     }
   };

   module.exports = { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment };