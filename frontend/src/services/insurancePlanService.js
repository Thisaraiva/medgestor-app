import api from './api'; // Importa a instância única da API

const INSURANCE_PLANS_API_URL = '/api/insurance-plans';

const insurancePlanService = {
  getAllInsurancePlans: () => {
    return api.get(INSURANCE_PLANS_API_URL);
  },

  getAllActiveInsurancePlans: () => {
    return api.get(`${INSURANCE_PLANS_API_URL}/active`);
  },

  createInsurancePlan: (planData) => {
    return api.post(INSURANCE_PLANS_API_URL, planData);
  },

  getInsurancePlanById: (planId) => {
    return api.get(`${INSURANCE_PLANS_API_URL}/${planId}`);
  },

  updateInsurancePlan: (planId, planData) => {
    return api.put(`${INSURANCE_PLANS_API_URL}/${planId}`, planData);
  },

  deleteInsurancePlan: (planId) => {
    return api.delete(`${INSURANCE_PLANS_API_URL}/${planId}`);
  },
};

export default insurancePlanService;