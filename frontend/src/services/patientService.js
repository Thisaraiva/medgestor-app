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

const getPatients = async () => {
  try {
    const response = await api.get(API_URL);
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
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};