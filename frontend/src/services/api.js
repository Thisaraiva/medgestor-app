// frontend/src/services/api.js

import axios from 'axios';

// Define a URL base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Cria a instância única do Axios
const api = axios.create({
    baseURL: API_BASE_URL,
});

// Adiciona o interceptor de requisição para injetar o token JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        // Adiciona o cabeçalho de autorização se o token existir
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Lida com erros de requisição
        return Promise.reject(error);
    }
);

// Exporta a instância da API para ser usada por outros serviços
export default api;