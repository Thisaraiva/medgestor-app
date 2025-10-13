// C:\Programacao\Projetos\JavaScript\medgestor-app\backend\middleware\__mocks__\authMiddleware.js

// Usamos os dados globais definidos em test_setup.js
const testUser = global.testAuthUser || { id: 9999, role: 'doctor', name: 'Test User' };

// 1. Mock do authMiddleware
const authMiddleware = (req, res, next) => {
  // **CORREÇÃO: Verificamos se o Authorization header está presente**
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    // Se não houver token, simulamos a falha 401 do middleware real (DRY/Single Responsibility)
    return res.status(401).json({ error: 'Acesso negado, token não fornecido' });
  }

  // Se o token estiver presente (em qualquer formato), simula o sucesso da autenticação
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