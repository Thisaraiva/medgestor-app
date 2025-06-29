// backend/services/userService.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');

const userService = {
  /**
   * Busca todos os usuários.
   * @returns {Promise<Array<object>>} - Lista de usuários.
   */
  getAllUsers: async () => {
    return User.findAll({ attributes: { exclude: ['password'] } });
  },

  /**
   * Busca um usuário por ID.
   * @param {string} id - ID do usuário.
   * @returns {Promise<object>} - O usuário encontrado.
   */
  getUserById: async (id) => {
    return User.findByPk(id, { attributes: { exclude: ['password'] } });
  },

  /**
   * Atualiza um usuário.
   * @param {string} id - ID do usuário a ser atualizado.
   * @param {object} userData - Dados para atualização.
   * @returns {Promise<object>} - O usuário atualizado.
   */
  updateUser: async (id, userData) => {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    user.name = userData.name || user.name;
    user.email = userData.email || user.email;
    user.role = userData.role || user.role;

    if (userData.password) {
      user.password = await bcrypt.hash(userData.password, 10);
    }

    await user.save();
    return User.findByPk(id, { attributes: { exclude: ['password'] } });
  },

  /**
   * Exclui um usuário.
   * @param {string} id - ID do usuário a ser excluído.
   * @returns {Promise<void>}
   */
  deleteUser: async (id) => {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }
    await user.destroy();
  },

  /**
   * Atualiza o próprio perfil do usuário.
   * @param {string} id - ID do usuário (deve ser o ID do usuário logado).
   * @param {object} userData - Dados para atualização (name, email, password).
   * @returns {Promise<object>} - O perfil atualizado.
   */
  updateMyProfile: async (id, userData) => {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    user.name = userData.name || user.name;
    user.email = userData.email || user.email;

    if (userData.password) {
      user.password = await bcrypt.hash(userData.password, 10);
    }

    await user.save();
    return User.findByPk(id, { attributes: { exclude: ['password'] } });
  }
};

module.exports = userService;
