const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { param } = require('express-validator');

const validate = (req, res, next) => {
  const errors = req.getValidationResult();
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/', authMiddleware, restrictTo('doctor','secretary', 'admin'), patientController.createPatient);
router.get('/', authMiddleware, patientController.getPatients);
router.get(
  '/:id',
  authMiddleware,
  [param('id').isUUID().withMessage('Paciente não encontrado')],
  validate,
  patientController.getPatientById
);
router.put(
  '/:id',
  authMiddleware,
  restrictTo('doctor','secretary', 'admin'),
  [param('id').isUUID().withMessage('Paciente não encontrado')],
  validate,
  patientController.updatePatient
);
router.delete(
  '/:id',
  authMiddleware,
  restrictTo('doctor','admin'),
  [param('id').isUUID().withMessage('Paciente não encontrado')],
  validate,
  patientController.deletePatient
);

module.exports = router;