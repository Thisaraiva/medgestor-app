// frontend/src/services/authService.js

import axios from 'axios';

// Define a URL base da API usando a variável de ambiente.
// Quando a aplicação React é construída, o Webpack substitui
// process.env.REACT_APP_API_URL pelo valor configurado no .env ou docker-compose.
// Isso garante que a URL seja dinâmica e funcione tanto em desenvolvimento quanto em produção.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/auth`; // Concatena com o endpoint de autenticação

/**
 * Função para registrar um novo usuário.
 * @param {string} name - Nome do usuário.
 * @param {string} email - Email do usuário.
 * @param {string} password - Senha do usuário.
 * @param {string} role - Papel/perfil do usuário (ex: 'medico', 'secretaria', 'paciente').
 * @returns {Promise<object>} - Dados da resposta da API.
 */
const register = async (name, email, password, role) => {
  try {
    const response = await axios.post(`${API_URL}/register`, { name, email, password, role });
    return response.data;
  } catch (error) {
    // Captura e relança o erro para que o componente que chamou possa tratá-lo.
    console.error('Erro no registro:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Função para realizar o login de um usuário.
 * @param {string} email - Email do usuário.
 * @param {string} password - Senha do usuário.
 * @returns {Promise<object>} - Dados da resposta da API, incluindo o token.
 */
const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    // Captura e relança o erro para que o componente que chamou possa tratá-lo.
    console.error('Erro no login:', error.response?.data || error.message);
    throw error;
  }
};

// Exporta as funções para serem utilizadas em outros componentes.
export default { register, login };
