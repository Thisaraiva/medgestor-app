// frontend/src/services/appointmentService.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const APPOINTMENTS_API_URL = `${API_BASE_URL}/api/appointments`;

const appointmentApi = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar o token de autenticação a todas as requisições
appointmentApi.interceptors.request.use(
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

const appointmentService = {
  /**
   * Cria um novo agendamento.
   * @param {object} appointmentData - Dados do agendamento (doctorId, patientId, date, type, insurance).
   * @returns {Promise<object>} O agendamento criado.
   */
  createAppointment: (appointmentData) => {
    return appointmentApi.post(APPOINTMENTS_API_URL, appointmentData);
  },

  /**
   * Obtém todos os agendamentos, opcionalmente com filtros.
   * @param {object} [filters] - Filtros para a busca (type, doctorId, patientId).
   * @returns {Promise<Array<object>>} Lista de agendamentos.
   */
  getAllAppointments: (filters = {}) => {
    return appointmentApi.get(APPOINTMENTS_API_URL, { params: filters });
  },

  /**
   * Obtém um agendamento por ID.
   * @param {string} appointmentId - ID do agendamento.
   * @returns {Promise<object>} O agendamento encontrado.
   */
  getAppointmentById: (appointmentId) => {
    return appointmentApi.get(`${APPOINTMENTS_API_URL}/${appointmentId}`);
  },

  /**
   * Atualiza um agendamento existente.
   * @param {string} appointmentId - ID do agendamento a ser atualizado.
   * @param {object} appointmentData - Dados do agendamento a serem atualizados.
   * @returns {Promise<object>} O agendamento atualizado.
   */
  updateAppointment: (appointmentId, appointmentData) => {
    return appointmentApi.put(`${APPOINTMENTS_API_URL}/${appointmentId}`, appointmentData);
  },

  /**
   * Exclui um agendamento.
   * @param {string} appointmentId - ID do agendamento a ser excluído.
   * @returns {Promise<void>}
   */
  deleteAppointment: (appointmentId) => {
    return appointmentApi.delete(`${APPOINTMENTS_API_URL}/${appointmentId}`);
  },
};

export default appointmentService;
