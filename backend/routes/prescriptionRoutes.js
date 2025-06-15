const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { param } = require('express-validator');

const validate = (req, res, next) => {
  const errors = req.getValidationResult();
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/', authMiddleware, restrictTo('doctor'), prescriptionController.createPrescription);
router.get(
  '/patient/:patientId',
  authMiddleware,
  [param('patientId').isUUID().withMessage('Patient ID must be a valid UUID')],
  validate,
  prescriptionController.getPrescriptionsByPatient
);

module.exports = router;