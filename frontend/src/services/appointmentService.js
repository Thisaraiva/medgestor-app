import api from './api'; // Importa a instância única da API

const APPOINTMENTS_API_URL = '/api/appointments';

const appointmentService = {
  createAppointment: (appointmentData) => {
    return api.post(APPOINTMENTS_API_URL, appointmentData);
  },

  getAllAppointments: (filters = {}) => {
    return api.get(APPOINTMENTS_API_URL, { params: filters });
  },

  getAppointmentById: (appointmentId) => {
    return api.get(`${APPOINTMENTS_API_URL}/${appointmentId}`);
  },

  updateAppointment: (appointmentId, appointmentData) => {
    return api.put(`${APPOINTMENTS_API_URL}/${appointmentId}`, appointmentData);
  },

  deleteAppointment: (appointmentId) => {
    return api.delete(`${APPOINTMENTS_API_URL}/${appointmentId}`);
  },
};

export default appointmentService;