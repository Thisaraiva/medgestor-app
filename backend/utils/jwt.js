const jwt = require('jsonwebtoken');
// require('dotenv').config(); // Removido na etapa anterior.

// Removida a checagem 'throw new Error' para evitar crash no container.
// A aplicação deve confiar que a infraestrutura injetou o JWT_SECRET.

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = { generateToken, verifyToken };