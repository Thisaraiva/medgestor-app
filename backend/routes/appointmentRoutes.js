const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Desestruturar
const { param } = require('express-validator');

const validate = (req, res, next) => {
    const errors = req.getValidationResult(); // Corrigir para validationResult
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.post('/', authMiddleware, appointmentController.createAppointment);
router.get('/', authMiddleware, appointmentController.getAppointments);
router.get(
    '/:id',
    authMiddleware,
    [param('id').isUUID().withMessage('ID must be a valid UUID')],
    validate,
    appointmentController.getAppointmentById
);
router.put(
    '/:id',
    authMiddleware,
    [param('id').isUUID().withMessage('Invalid ID')],
    validate,
    appointmentController.updateAppointment
);
router.delete(
    '/:id',
    authMiddleware,
    [param('id').isUUID().withMessage('ID must be a valid UUID')],
    validate,
    appointmentController.deleteAppointment
);

module.exports = router;