const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, prescriptionController.createPrescription);
router.get('/patient/:patientId', authMiddleware, prescriptionController.getPrescriptionsByPatient);

module.exports = router;