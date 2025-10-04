// C:\Programacao\Projetos\JavaScript\medgestor-app\backend\middleware/__mocks__/authMiddleware.js

/**
 * MOCK do authMiddleware para Testes de Integração
 *
 * Objetivo: Ignorar a verificação real do JWT e simular a autenticação
 * injetando um usuário de teste na requisição (req.user).
 *
 * Isso garante que a Rota/Controller seja testada, enquanto a lógica
 * de JWT é testada separadamente em testes unitários.
 */

// Usamos os dados globais definidos em test_setup.js
const testUser = global.testAuthUser || { id: 9999, role: 'doctor', name: 'Test User' }; 

// 1. Mock do authMiddleware
const authMiddleware = (req, res, next) => {
  // Simula o usuário autenticado, ignorando a verificação do token
  req.user = testUser; 
  next();
};

// 2. Mock do restrictTo
const restrictTo = (...roles) => (req, res, next) => {
  // Usamos a lógica real, mas com o usuário de teste injetado
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Acesso negado: permissão insuficiente (MOCK)' });
  }
  next();
};

module.exports = { authMiddleware, restrictTo };