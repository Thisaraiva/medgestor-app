// C:\Programacao\Projetos\JavaScript\medgestor-app\frontend\src\services\prescriptionService.js

import api from './api';

const prescriptionService = {
  createPrescription: async (prescriptionData) => {
    const response = await api.post('/prescriptions', prescriptionData);
    return response.data;
  },

  getPrescriptionsByPatient: async (patientId) => {
    // Rota correta para o backend: /api/prescriptions/patient/:patientId
    const response = await api.get(`/prescriptions/patient/${patientId}`);
    return response.data;
  },

  getPrescriptionById: async (id) => {
    const response = await api.get(`/prescriptions/${id}`);
    return response.data;
  },

  updatePrescription: async (id, prescriptionData) => {
    const response = await api.put(`/prescriptions/${id}`, prescriptionData);
    return response.data;
  },

  deletePrescription: async (id) => {
    const response = await api.delete(`/prescriptions/${id}`);
    return response.data;
  },
};

export default prescriptionService;