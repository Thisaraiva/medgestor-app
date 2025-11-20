// C:\Programacao\Projetos\JavaScript\medgestor-app\backend\routes\recordRoutes.js

const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');

// Define um middleware de autenticação e permissão para todas as rotas deste router
// Isso elimina a repetição de código em cada rota
router.use(authMiddleware, restrictTo('admin', 'doctor','secretary'));

// Rota para buscar todos os prontuários de um paciente específico
router.get(
  '/by-patient/:patientId',
  recordController.getRecordsByPatient
);

// Rota para criar um novo prontuário
router.post(
  '/',
  recordController.createRecord
);

// Rotas para obter, atualizar e deletar um prontuário por ID
router.get(
  '/:id',
  recordController.getRecordById
);

router.put(
  '/:id',
  recordController.updateRecord
);

router.delete(
  '/:id',
  recordController.deleteRecord
);

module.exports = router;