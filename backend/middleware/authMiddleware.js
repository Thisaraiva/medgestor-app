// backend/middleware/authMiddleware.js

const { verifyToken } = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Acesso negado, token não fornecido' });
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Adiciona os dados do usuário decodificados à requisição
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const restrictTo = (...roles) => (req, res, next) => {
  // Verifica se req.user existe e se o papel do usuário está incluído nos papéis permitidos
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Acesso negado: permissão insuficiente' });
  }
  next();
};

module.exports = { authMiddleware, restrictTo };
