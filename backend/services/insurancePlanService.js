// backend/services/insurancePlanService.js

const { InsurancePlan } = require('../models');
const { NotFoundError, ValidationError } = require('../errors/errors');
const { Op } = require('sequelize');
const Joi = require('joi');

const insurancePlanSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    'string.min': 'Nome do convênio deve ter pelo menos 3 caracteres',
    'any.required': 'Nome do convênio é obrigatório',
  }),
  description: Joi.string().allow(null, '').optional(),
  isActive: Joi.boolean().optional(),
});

const createInsurancePlan = async (data) => {
  const { error } = insurancePlanSchema.validate(data);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const existingPlan = await InsurancePlan.findOne({ where: { name: data.name } });
  if (existingPlan) {
    throw new ValidationError('Já existe um convênio com este nome.');
  }

  return InsurancePlan.create(data);
};

const getAllInsurancePlans = async () => {
  return InsurancePlan.findAll({
    where: { isActive: true }, // Apenas planos ativos
    attributes: ['id', 'name', 'description'],
    order: [['name', 'ASC']],
  });
};

const getInsurancePlanById = async (id) => {
  const plan = await InsurancePlan.findByPk(id);
  if (!plan) {
    throw new NotFoundError('Plano de saúde não encontrado.');
  }
  return plan;
};

const updateInsurancePlan = async (id, data) => {
  const plan = await InsurancePlan.findByPk(id);
  if (!plan) {
    throw new NotFoundError('Plano de saúde não encontrado.');
  }

  const { error } = insurancePlanSchema.validate(data, { allowUnknown: true, abortEarly: false });
  if (error) {
    throw new ValidationError(error.details.map(x => x.message).join(', '));
  }

  if (data.name && data.name !== plan.name) {
    const existingPlanWithName = await InsurancePlan.findOne({ where: { name: data.name, id: { [Op.ne]: id } } });
    if (existingPlanWithName) {
      throw new ValidationError('Já existe outro convênio com este nome.');
    }
  }

  await plan.update(data);
  return plan;
};

const deleteInsurancePlan = async (id) => {
  const plan = await InsurancePlan.findByPk(id);
  if (!plan) {
    throw new NotFoundError('Plano de saúde não encontrado.');
  }
  await plan.destroy();
};

module.exports = {
  createInsurancePlan,
  getAllInsurancePlans,
  getInsurancePlanById,
  updateInsurancePlan,
  deleteInsurancePlan,
};
