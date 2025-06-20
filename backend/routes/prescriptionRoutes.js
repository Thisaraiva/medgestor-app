const express = require('express');
const router = express.Router();
const { createPrescription, getPrescriptionsByPatient, updatePrescription } = require('../controllers/prescriptionController');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, restrictTo('doctor'), createPrescription);
router.get('/patient/:patientId', authMiddleware, restrictTo('doctor'), getPrescriptionsByPatient);
router.put('/:id', authMiddleware, restrictTo('doctor'), updatePrescription);

module.exports = router;