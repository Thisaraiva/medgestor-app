// backend/routes/userRoutes.js

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

// Rota para o próprio usuário editar seu perfil (acessível por todos os roles autenticados)
// Note que esta rota usa o authMiddleware para verificar o token, mas não restrictTo
// pois qualquer usuário autenticado pode editar SEU PRÓPRIO perfil.
// A lógica dentro do controller garantirá que o usuário só edite o próprio perfil.
router.put('/profile/:id', authMiddleware, userController.updateMyProfile); // Rota para editar o próprio perfil

module.exports = router;
