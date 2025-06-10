const patientService = require('../services/patientService');

     const createPatient = async (req, res) => {
       try {
         const patient = await patientService.createPatient(req.body);
         res.status(201).json(patient);
       } catch (error) {
         res.status(400).json({ error: error.message });
       }
     };

     const getPatients = async (req, res) => {
       try {
         const patients = await patientService.getPatients();
         res.json(patients);
       } catch (error) {
         res.status(400).json({ error: error.message });
       }
     };

     const getPatientById = async (req, res) => {
       try {
         const patient = await patientService.getPatientById(req.params.id);
         res.json(patient);
       } catch (error) {
         res.status(400).json({ error: error.message });
       }
     };

     const updatePatient = async (req, res) => {
       try {
         const patient = await patientService.updatePatient(req.params.id, req.body);
         res.json(patient);
       } catch (error) {
         res.status(400).json({ error: error.message });
       }
     };

     const deletePatient = async (req, res) => {
       try {
         await patientService.deletePatient(req.params.id);
         res.status(204).send();
       } catch (error) {
         res.status(400).json({ error: error.message });
       }
     };

     module.exports = { createPatient, getPatients, getPatientById, updatePatient, deletePatient };