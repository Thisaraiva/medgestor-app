import axios from 'axios';
import api from './api'; // Importa a instância única da API

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const AUTH_API_URL = `${API_BASE_URL}/api/auth`;
const USERS_API_URL = `${API_BASE_URL}/api/users`;

const authService = {
  login: (email, password) => {
    return axios.post(`${AUTH_API_URL}/login`, { email, password });
  },

  register: (userData) => {
    return api.post(`${AUTH_API_URL}/register`, userData);
  },

  getAllUsers: () => {
    return api.get(USERS_API_URL);
  },

  getUserById: (userId) => {
    return api.get(`${USERS_API_URL}/${userId}`);
  },

  updateUser: (userId, userData) => {
    return api.put(`${USERS_API_URL}/${userId}`, userData);
  },

  deleteUser: (userId) => {
    return api.delete(`${USERS_API_URL}/${userId}`);
  },

  updateMyProfile: (userId, userData) => {
    return api.put(`${USERS_API_URL}/profile/${userId}`, userData);
  },
};

export default authService;