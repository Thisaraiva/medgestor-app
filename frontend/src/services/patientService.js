// frontend/src/services/patientService.js

import axios from 'axios';

// Define a URL base da API usando a variável de ambiente.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/patients`; // Concatena com o endpoint de pacientes

// Cria uma instância do Axios para requisições de pacientes que precisam de autenticação.
const patientApi = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor de requisição: Adiciona o token JWT a todas as requisições
// enviadas por esta instância do Axios.
patientApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Função para criar um novo paciente.
 * @param {object} patientData - Dados do paciente (nome, cpf, telefone, alergias, email).
 * @returns {Promise<object>} - Dados do paciente criado.
 */
const createPatient = async (patientData) => {
  try {
    const response = await patientApi.post(API_URL, patientData); // Usa a instância com interceptor
    return response.data;
  } catch (error) {
    console.error('Erro ao criar paciente:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Função para obter a lista de pacientes.
 * @returns {Promise<Array<object>>} - Lista de pacientes.
 */
const getPatients = async () => {
  try {
    const response = await patientApi.get(API_URL); // Usa a instância com interceptor
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar pacientes:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Função para buscar um paciente por ID.
 * @param {string} patientId - O ID do paciente.
 * @returns {Promise<object>} - Dados do paciente.
 */
const getPatientById = async (patientId) => {
  try {
    const response = await patientApi.get(`${API_URL}/${patientId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar paciente:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Função para atualizar um paciente existente.
 * @param {string} patientId - ID do paciente a ser atualizado.
 * @param {object} patientData - Dados atualizados do paciente.
 * @returns {Promise<object>} - Dados do paciente atualizado.
 */
const updatePatient = async (patientId, patientData) => {
  try {
    const response = await patientApi.put(`${API_URL}/${patientId}`, patientData); // Usa a instância com interceptor
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar paciente ${patientId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Função para excluir um paciente.
 * @param {string} patientId - ID do paciente a ser excluído.
 * @returns {Promise<object>} - Confirmação da exclusão.
 */
const deletePatient = async (patientId) => {
  try {
    const response = await patientApi.delete(`${API_URL}/${patientId}`); // Usa a instância com interceptor
    return response.data;
  } catch (error) {
    console.error(`Erro ao excluir paciente ${patientId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Exporta todas as funções.
export default {
  createPatient,
  getPatients,
  getPatientById, // Adicionado para completude, útil para edição
  updatePatient,
  deletePatient,
};