const express = require('express');
   const router = express.Router();
   const appointmentController = require('../controllers/appointmentController');
   const authMiddleware = require('../middleware/authMiddleware');

   router.post('/', authMiddleware, appointmentController.createAppointment);
   router.get('/', authMiddleware, appointmentController.getAppointments);
   router.get('/:id', authMiddleware, appointmentController.getAppointmentById);
   router.put('/:id', authMiddleware, appointmentController.updateAppointment);
   router.delete('/:id', authMiddleware, appointmentController.deleteAppointment);

   module.exports = router;