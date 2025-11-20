const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { param, validationResult } = require('express-validator'); // Importar validationResult

// Middleware de validação atualizado
const validateRequest = (req, res, next) => { // Renomeado para evitar conflito com 'validate' de exemplo
  const errors = validationResult(req); // Usar validationResult(req)
  if (!errors.isEmpty()) {
    // Formate os erros para serem mais amigáveis no frontend
    return res.status(400).json({ errors: errors.array().map(err => err.msg) });
  }
  next();
};

router.post('/', authMiddleware, restrictTo('doctor','secretary', 'admin'), patientController.createPatient);
router.get('/', authMiddleware, patientController.getPatients);
router.get(
  '/:id',
  authMiddleware,
  [param('id').isUUID().withMessage('ID do paciente inválido')], // Mensagem mais clara
  validateRequest, // Usar o novo middleware
  patientController.getPatientById
);
router.put(
  '/:id',
  authMiddleware,
  restrictTo('doctor','secretary', 'admin'),
  [param('id').isUUID().withMessage('ID do paciente inválido')],
  validateRequest, // Usar o novo middleware
  patientController.updatePatient
);
router.delete(
  '/:id',
  authMiddleware,
  restrictTo('doctor','admin', 'secretary'),
  [param('id').isUUID().withMessage('ID do paciente inválido')],
  validateRequest, // Usar o novo middleware
  patientController.deletePatient
);

module.exports = router;