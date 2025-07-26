// frontend/src/services/insurancePlanService.js

import axios from 'axios';

// Define the base API URL using the environment variable.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
// Concatenate with the specific endpoint for insurance plans.
const INSURANCE_PLANS_API_URL = `${API_BASE_URL}/api/insurance-plans`;

// Creates an Axios instance for insurance plan requests that require authentication.
const insurancePlanApi = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor: Adds the JWT token to all requests
// sent by this Axios instance.
insurancePlanApi.interceptors.request.use(
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
 * Service object for interacting with the insurance plans API.
 */
const insurancePlanService = {
  /**
   * Retrieves all insurance plans (active and inactive) for management purposes.
   * @returns {Promise<object>} A promise that resolves to the API response (containing the list of plans in response.data).
   */
  getAllInsurancePlans: () => {
    return insurancePlanApi.get(INSURANCE_PLANS_API_URL); // Esta rota agora retorna todos os planos
  },

  /**
   * Retrieves all ACTIVE insurance plans for selection in contexts like appointment creation.
   * @returns {Promise<object>} A promise that resolves to the API response (containing the list of active plans in response.data).
   */
  getAllActiveInsurancePlans: () => {
    return insurancePlanApi.get(`${INSURANCE_PLANS_API_URL}/active`); // Nova rota para planos ativos
  },

  /**
   * Creates a new insurance plan.
   * @param {object} planData - Data of the insurance plan to be created (e.g., { name: 'Unimed', description: '...' }).
   * @returns {Promise<object>} A promise that resolves to the API response.
   */
  createInsurancePlan: (planData) => {
    return insurancePlanApi.post(INSURANCE_PLANS_API_URL, planData);
  },

  /**
   * Retrieves a specific insurance plan by ID.
   * @param {string} planId - The UUID of the insurance plan.
   * @returns {Promise<object>} A promise that resolves to the API response.
   */
  getInsurancePlanById: (planId) => {
    return insurancePlanApi.get(`${INSURANCE_PLANS_API_URL}/${planId}`);
  },

  /**
   * Updates an existing insurance plan.
   * @param {string} planId - The UUID of the insurance plan to be updated.
   * @param {object} planData - The updated data of the insurance plan.
   * @returns {Promise<object>} A promise that resolves to the API response.
   */
  updateInsurancePlan: (planId, planData) => {
    return insurancePlanApi.put(`${INSURANCE_PLANS_API_URL}/${planId}`, planData);
  },

  /**
   * Deletes an insurance plan.
   * @param {string} planId - The UUID of the insurance plan to be deleted.
   * @returns {Promise<object>} A promise that resolves to the API response.
   */
  deleteInsurancePlan: (planId) => {
    return insurancePlanApi.delete(`${INSURANCE_PLANS_API_URL}/${planId}`);
  },
};

export default insurancePlanService;