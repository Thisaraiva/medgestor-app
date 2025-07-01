// frontend/src/services/authService.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const AUTH_API_URL = `${API_BASE_URL}/api/auth`;
const USERS_API_URL = `${API_BASE_URL}/api/users`;

const authApi = axios.create({
  baseURL: API_BASE_URL,
});

authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.url.endsWith('/login')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const authService = {
  login: (email, password) => {
    return axios.post(`${AUTH_API_URL}/login`, { email, password });
  },

  register: (userData) => {
    return authApi.post(`${AUTH_API_URL}/register`, userData);
  },

  getAllUsers: () => {
    return authApi.get(USERS_API_URL);
  },

  // Adicionando a função getUserById
  getUserById: (userId) => {
    return authApi.get(`${USERS_API_URL}/${userId}`);
  },

  updateUser: (userId, userData) => {
    return authApi.put(`${USERS_API_URL}/${userId}`, userData);
  },

  deleteUser: (userId) => {
    return authApi.delete(`${USERS_API_URL}/${userId}`);
  },

  updateMyProfile: (userId, userData) => {
    return authApi.put(`${USERS_API_URL}/profile/${userId}`, userData);
  },
};

export default authService;
