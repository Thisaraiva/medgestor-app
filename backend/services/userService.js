// C:\Programacao\Projetos\JavaScript\medgestor-app\backend\services\userService.js (COMPLETO)

const User = require('../models/User');
const { NotFoundError } = require('../errors/errors');

/**
 * Função utilitária interna para atualizar os campos do usuário. (DRY)
 * @param {object} user - Instância do modelo Sequelize.
 * @param {object} userData - Dados para atualização.
 */
const updateFields = async (user, userData) => {
    user.name = userData.name || user.name;
    user.email = userData.email || user.email;
    
    if (userData.password) {
        // O hook beforeSave no modelo User fará o hash
        user.password = userData.password; 
    }
    
    // O CRM/Role só deve ser atualizado se o campo estiver presente
    if (Object.prototype.hasOwnProperty.call(userData, 'role')) {
        user.role = userData.role;
    }
    if (Object.prototype.hasOwnProperty.call(userData, 'crm')) {
        user.crm = userData.crm;
    }

    await user.save();
    return User.findByPk(user.id, { attributes: { exclude: ['password'] } });
};

const userService = {
  
  getAllUsers: async () => {
    return User.findAll({ attributes: { exclude: ['password'] } });
  },

  getUserById: async (id) => {
    return User.findByPk(id, { attributes: { exclude: ['password'] } });
  },

  updateUser: async (id, userData) => {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    // Chamada à função utilitária para manter DRY
    return updateFields(user, userData);
  },

  deleteUser: async (id) => {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }
    await user.destroy();
  },

  updateMyProfile: async (id, userData) => {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    // Remove role/crm para garantir que o usuário não mude o próprio papel/crm nesta rota
    const sanitizedData = { ...userData };
    delete sanitizedData.role; 
    delete sanitizedData.crm;

    // Chamada à função utilitária para manter DRY
    return updateFields(user, sanitizedData);
  }
};

module.exports = userService;