// backend/services/authService.js

const bcryptjs = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { ValidationError, NotFoundError } = require('../errors/errors');

const authService = {
  register: async (userData) => {
    const { email } = userData; // Removido 'role' da desestruturação para ESLint

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ValidationError('Email já registrado');
    }

    const newUser = await User.create({
      ...userData, // Inclui name, email, password, role, crm
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      crm: newUser.crm,
    };
  },

  login: async ({ email, password }) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundError('Email ou senha inválidos');
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      throw new NotFoundError('Email ou senha inválidos');
    }

    // Gerar token com id, role, name e email
    const token = generateToken({ id: user.id, role: user.role, name: user.name, email: user.email });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      crm: user.crm,
      token,
    };
  },
};

module.exports = authService;
