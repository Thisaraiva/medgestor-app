// frontend/src/services/medicalRecordService.js

import api from './api';

const medicalRecordService = {
  // Corrigido para chamar o endpoint do backend
  getRecordsByPatient: async (patientId) => {
    try {
      const response = await api.get(`/api/records/by-patient/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao buscar prontuários';
    }
  },

  createRecord: async (recordData) => {
    try {
      const response = await api.post('/api/records', recordData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao criar prontuário';
    }
  },

  getRecordById: async (recordId) => {
    try {
      const response = await api.get(`/api/records/${recordId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao buscar prontuário';
    }
  },

  updateRecord: async (recordId, recordData) => {
    try {
      const response = await api.put(`/api/records/${recordId}`, recordData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao atualizar prontuário';
    }
  },

  deleteRecord: async (recordId) => {
    try {
      await api.delete(`/api/records/${recordId}`);
      return { success: true };
    } catch (error) {
      throw error.response?.data?.error || 'Erro ao deletar prontuário';
    }
  },
};

export default medicalRecordService;