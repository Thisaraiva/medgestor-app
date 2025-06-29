// frontend/src/services/authService.js

import axios from 'axios';

// Define a URL base da API a partir das variáveis de ambiente do Webpack
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const AUTH_API_URL = `${API_BASE_URL}/api/auth`; // Endpoint específico para autenticação
const USERS_API_URL = `${API_BASE_URL}/api/users`; // Endpoint para gerenciamento de usuários

// Cria uma instância do Axios para requisições que precisam de autenticação.
// Esta instância será usada para rotas PROTEGIDAS.
const authApi = axios.create({
  baseURL: API_BASE_URL, // A URL base é a raiz da API
});

// Interceptor de requisição: Adiciona o token JWT a todas as requisições
// enviadas por esta instância do Axios, exceto para a rota de LOGIN.
// A rota de REGISTRO (auth/register) AGORA DEVE ENVIAR O TOKEN do usuário logado.
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Adiciona o cabeçalho de Autorização apenas se o token existir
    // e se a requisição NÃO for para a rota de login.
    // A rota de registro agora exige token, então o interceptor DEVE aplicá-lo.
    if (token && !config.url.endsWith('/login')) { // Removido !config.url.endsWith('/register')
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Serviço de autenticação para interagir com a API de autenticação.
 */
const authService = {
  /**
   * Realiza o login do usuário.
   * Não usa o interceptor pois não há token ainda.
   * @param {string} email - O email do usuário.
   * @param {string} password - A senha do usuário.
   * @returns {Promise<object>} - Uma promessa que resolve com a resposta COMPLETA do Axios.
   */
  login: (email, password) => {
    // Retorna a resposta completa do Axios, não apenas response.data
    return axios.post(`${AUTH_API_URL}/login`, { email, password });
  },

  /**
   * Registra um novo usuário.
   * Usa a instância 'authApi' que agora envia o token do usuário logado.
   * @param {string} name - O nome do usuário.
   * @param {string} email - O email do usuário.
   * @param {string} password - A senha do usuário.
   * @param {string} role - O papel do usuário (ex: 'admin', 'doctor', 'secretary').
   * @returns {Promise<object>} - Uma promessa que resolve com os dados da resposta.
   */
  register: (name, email, password, role) => {
    return authApi.post(`${AUTH_API_URL}/register`, { name, email, password, role });
  },

  /**
   * Busca todos os usuários (rota protegida).
   * @returns {Promise<Array<object>>} - Uma promessa que resolve com a lista de usuários.
   */
  getAllUsers: () => {
    return authApi.get(USERS_API_URL);
  },

  /**
   * Atualiza o perfil de um usuário específico (rota protegida).
   * @param {string} userId - ID do usuário a ser atualizado.
   * @param {object} userData - Dados do usuário para atualização.
   * @returns {Promise<object>} - Promessa que resolve com os dados do usuário atualizado.
   */
  updateUser: (userId, userData) => { // Renomeado de updateUserProfile para clareza
    return authApi.put(`${USERS_API_URL}/${userId}`, userData);
  },

  /**
   * Exclui um usuário (rota protegida).
   * @param {string} userId - ID do usuário a ser excluído.
   * @returns {Promise<object>} - Promessa que resolve com a confirmação da exclusão.
   */
  deleteUser: (userId) => {
    return authApi.delete(`${USERS_API_URL}/${userId}`);
  },

  /**
   * Atualiza o próprio perfil do usuário logado (rota protegida).
   * @param {string} userId - ID do usuário logado.
   * @param {object} userData - Dados para atualização (name, email, password).
   * @returns {Promise<object>} - Promessa que resolve com o perfil atualizado.
   */
  updateMyProfile: (userId, userData) => {
    return authApi.put(`${USERS_API_URL}/profile/${userId}`, userData);
  },
};

export default authService;
