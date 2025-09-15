// C:\Programacao\Projetos\JavaScript\medgestor-app\frontend\src\services\authService.js

import api from './api'; // Usar a instância única da API

const authService = {
  login: (email, password) => {
    // Usar a instância 'api' para o login também
    // O interceptor do `api` não injeta token para login, pois ainda não existe, então está correto usar ele
    return api.post('/auth/login', { email, password });
  },

  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  getAllUsers: () => {
    // Note que a rota para usuários é '/api/users' no backend
    // Como api.js já tem '/api', a chamada é apenas '/users'
    return api.get('/users');
  },

  getUserById: (userId) => {
    return api.get(`/users/${userId}`);
  },

  updateUser: (userId, userData) => {
    return api.put(`/users/${userId}`, userData);
  },

  deleteUser: (userId) => {
    return api.delete(`/users/${userId}`);
  },

  updateMyProfile: (userId, userData) => {
    return api.put(`/users/profile/${userId}`, userData);
  },
};

export default authService;