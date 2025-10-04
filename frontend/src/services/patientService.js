// C:\Programacao\Projetos\JavaScript\medgestor-app\frontend\src\services\patientService.js

import api from './api';

const API_URL = '/patients';

const createPatient = async (patientData) => {
  try {
    const response = await api.post(API_URL, patientData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar paciente:', error.response?.data || error.message);
    throw error;
  }
};

// MODIFICADO: Agora aceita um objeto de filtros (ex: { name: 'João' })
const getPatients = async (filters = {}) => {
  try {
    // Constrói a string de query com base nos filtros
    // Ex: {name: 'joao', cpf: '123'} -> ?name=joao&cpf=123
    const query = new URLSearchParams(filters).toString();
    // Se a query for vazia, a URL será /patients. Se não, será /patients?name=...
    const response = await api.get(`${API_URL}${query ? `?${query}` : ''}`); 
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar pacientes:', error.response?.data || error.message);
    throw error;
  }
};

const getPatientById = async (patientId) => {
  try {
    const response = await api.get(`${API_URL}/${patientId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar paciente:', error.response?.data || error.message);
    throw error;
  }
};

const updatePatient = async (patientId, patientData) => {
  try {
    const response = await api.put(`${API_URL}/${patientId}`, patientData);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar paciente ${patientId}:`, error.response?.data || error.message);
    throw error;
  }
};

const deletePatient = async (patientId) => {
  try {
    const response = await api.delete(`${API_URL}/${patientId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao excluir paciente ${patientId}:`, error.response?.data || error.message);
    throw error;
  }
};

export default {
  createPatient,
  getPatients, // Usaremos esta função com filtros
  getPatientById,
  updatePatient,
  deletePatient,
};