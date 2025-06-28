// frontend/src/services/patientService.js

import axios from 'axios';

// Define a URL base da API usando a variável de ambiente.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/patients`; // Concatena com o endpoint de pacientes

/**
 * Função para criar um novo paciente.
 * Requer autenticação (token JWT).
 * @param {object} patientData - Dados do paciente (nome, cpf, telefone, alergias).
 * @returns {Promise<object>} - Dados do paciente criado.
 */
const createPatient = async (patientData) => {
  const token = localStorage.getItem('token'); // Obtém o token do localStorage
  try {
    const response = await axios.post(API_URL, patientData, {
      headers: { Authorization: `Bearer ${token}` }, // Adiciona o token no cabeçalho de autorização
    });
    return response.data;
  } catch (error) {
    // Captura e relança o erro.
    console.error('Erro ao criar paciente:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Função para obter a lista de pacientes.
 * Requer autenticação (token JWT).
 * @returns {Promise<Array<object>>} - Lista de pacientes.
 */
const getPatients = async () => {
  const token = localStorage.getItem('token'); // Obtém o token do localStorage
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }, // Adiciona o token no cabeçalho de autorização
    });
    return response.data;
  } catch (error) {
    // Captura e relança o erro.
    console.error('Erro ao carregar pacientes:', error.response?.data || error.message);
    throw error;
  }
};

// Exporta as funções.
export default { createPatient, getPatients };
