// C:\Programacao\Projetos\JavaScript\medgestor-app\frontend\src\services\insurancePlanService.js

import api from './api';

const insurancePlanService = {
  getAllInsurancePlans: () => {
    return api.get('/insurance-plans');
  },

  getAllActiveInsurancePlans: () => {
    return api.get('/insurance-plans/active');
  },

  createInsurancePlan: (planData) => {
    return api.post('/insurance-plans', planData);
  },

  getInsurancePlanById: (planId) => {
    return api.get(`/insurance-plans/${planId}`);
  },

  updateInsurancePlan: (planId, planData) => {
    return api.put(`/insurance-plans/${planId}`, planData);
  },

  deleteInsurancePlan: (planId) => {
    return api.delete(`/insurance-plans/${planId}`);
  },
};

export default insurancePlanService;