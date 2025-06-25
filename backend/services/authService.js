const bcryptjs = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { ValidationError, NotFoundError } = require('../errors/errors');

const register = async ({ name, email, password, role, crm }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ValidationError('Email já registrado');
  }

  const user = await User.create({
    name,
    email,
    password, // Será hasheado pelo hook beforeSave no modelo User
    role,
    crm: role === 'doctor' ? crm : null,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    crm: user.crm,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundError('Email ou senha inválidos');
  }

  const isMatch = await bcryptjs.compare(password, user.password);
  if (!isMatch) {
    throw new NotFoundError('Email ou senha inválidos');
  }

  const token = generateToken({ id: user.id, role: user.role });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    crm: user.crm,
    token,
  };
};

module.exports = { register, login };