// C:\Programacao\Projetos\JavaScript\medgestor-app\frontend\src\services\medicalRecordService.js

import api from './api';

const medicalRecordService = {
  getRecordsByPatient: async (patientId) => {
    try {
      const response = await api.get(`/records/by-patient/${patientId}`);
      return response.data;
    } catch (error) {
      // Propaga o erro de forma consistente para ser tratado pelo componente
      throw error;
    }
  },

  createRecord: async (recordData) => {
    try {
      const response = await api.post('/records', recordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getRecordById: async (recordId) => {
    try {
      const response = await api.get(`/records/${recordId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateRecord: async (recordId, recordData) => {
    try {
      const response = await api.put(`/records/${recordId}`, recordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteRecord: async (recordId) => {
    try {
      const response = await api.delete(`/records/${recordId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default medicalRecordService;