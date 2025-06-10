const appointmentService = require('../services/appointmentService');

     const createAppointment = async (req, res) => {
       try {
         const appointment = await appointmentService.createAppointment(req.body);
         res.status(201).json(appointment);
       } catch (error) {
         res.status(400).json({ error: error.message });
       }
     };

     const getAppointments = async (req, res) => {
       try {
         const appointments = await appointmentService.getAppointments();
         res.json(appointments);
       } catch (error) {
         res.status(400).json({ error: error.message });
       }
     };

     const getAppointmentById = async (req, res) => {
       try {
         const appointment = await appointmentService.getAppointmentById(req.params.id);
         res.json(appointment);
       } catch (error) {
         res.status(400).json({ error: error.message });
       }
     };

     const updateAppointment = async (req, res) => {
       try {
         const appointment = await appointmentService.updateAppointment(req.params.id, req.body);
         res.json(appointment);
       } catch (error) {
         res.status(400).json({ error: error.message });
       }
     };

     const deleteAppointment = async (req, res) => {
       try {
         await appointmentService.deleteAppointment(req.params.id);
         res.status(204).send();
       } catch (error) {
         res.status(400).json({ error: error.message });
       }
     };

     module.exports = { createAppointment, getAppointments, getAppointmentById, updateAppointment, deleteAppointment };