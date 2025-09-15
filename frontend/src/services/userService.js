// frontend/src/services/userService.js

import api from './api';

const userService = {
    /**
     * Busca os dados de um único usuário pelo ID.
     * @param {string} userId - O ID do usuário.
     * @returns {Promise<object>} Os dados do usuário.
     */
    getUserById: async (userId) => {
        try {
            const response = await api.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar usuário com ID ${userId}:`, error);
            throw error;
        }
    }
};

export default userService;
