// C:\Programacao\Projetos\JavaScript\medgestor-app\frontend\src\services\appointmentService.js

import api from './api';

const appointmentService = {
  createAppointment: (appointmentData) => {
    return api.post('/appointments', appointmentData);
  },

  getAllAppointments: (filters = {}) => {
    return api.get('/appointments', { params: filters });
  },

  getAppointmentById: (appointmentId) => {
    return api.get(`/appointments/${appointmentId}`);
  },

  updateAppointment: (appointmentId, appointmentData) => {
    return api.put(`/appointments/${appointmentId}`, appointmentData);
  },

  deleteAppointment: (appointmentId) => {
    return api.delete(`/appointments/${appointmentId}`);
  },
};

export default appointmentService;