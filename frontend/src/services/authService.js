// C:\Programacao\Projetos\JavaScript\medgestor-app\frontend\src\services\authService.js

import api from './api';

const authService = {
  login: (email, password) => {   
    return api.post('/auth/login', { email, password });
  },

  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  getAllUsers: () => {    
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