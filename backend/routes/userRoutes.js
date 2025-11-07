// backend/routes/userRoutes.js (COMPLETO)

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');

// Rotas para gerenciamento de usuários
// Todas as rotas abaixo exigem autenticação e são restritas a 'admin'
router.get('/', authMiddleware, restrictTo('admin', 'doctor', 'secretary'), userController.getAllUsers); // Listar todos os usuários
router.get('/:id', authMiddleware, restrictTo('admin', 'doctor', 'secretary'), userController.getUserById); // Obter usuário por ID
router.put('/:id', authMiddleware, restrictTo('admin', 'doctor', 'secretary'), userController.updateUser); // Atualizar usuário
router.delete('/:id', authMiddleware, restrictTo('admin', 'doctor', 'secretary'), userController.deleteUser); // Excluir usuário

// NOVA ROTA: Endpoint específico para médicos (acessível para admin, doctor, secretary)
router.get('/doctors/list', authMiddleware, restrictTo('admin', 'doctor', 'secretary'), userController.getDoctors);

// Rota para o próprio usuário editar seu perfil (acessível por todos os roles autenticados)
router.put('/profile/:id', authMiddleware, userController.updateMyProfile);

module.exports = router;