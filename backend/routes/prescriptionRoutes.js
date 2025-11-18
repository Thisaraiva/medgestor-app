// backend/routes/prescriptionRoutes.js

const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { param, validationResult } = require('express-validator');

// Middleware de validação genérico
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map(err => err.msg) });
    }
    next();
};

// Rotas para prescrições
// Rota para buscar todas as prescrições de um paciente
router.get(
    '/patient/:patientId',
    authMiddleware,
    restrictTo('admin', 'doctor', 'secretary'),
    [param('patientId').isUUID().withMessage('ID do paciente inválido')],
    validateRequest,
    prescriptionController.getPrescriptionsByPatient
);

// Rota para criar uma nova prescrição
router.post(
    '/',
    authMiddleware,
    restrictTo('doctor', 'admin'),
    prescriptionController.createPrescription
);

// Rota para buscar uma única prescrição por ID
router.get(
    '/:id',
    authMiddleware,
    restrictTo('admin', 'doctor', 'secretary'),
    [param('id').isUUID().withMessage('ID da prescrição inválido')],
    validateRequest,
    prescriptionController.getPrescriptionById
);

// Rota para atualizar uma prescrição
router.put(
    '/:id',
    authMiddleware,
    restrictTo('doctor', 'admin'),
    [param('id').isUUID().withMessage('ID da prescrição inválido')],
    validateRequest,
    prescriptionController.updatePrescription
);

// Rota para excluir uma prescrição
router.delete(
    '/:id',
    authMiddleware,
    restrictTo('doctor', 'admin'),
    [param('id').isUUID().withMessage('ID da prescrição inválido')],
    validateRequest,
    prescriptionController.deletePrescription
);

module.exports = router;