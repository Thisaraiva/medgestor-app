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
  // O isActive pode ser opcional na criação, mas é importante para o gerenciamento
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

  // Define isActive como true por padrão se não for fornecido na criação
  const planToCreate = { ...data, isActive: data.isActive === undefined ? true : data.isActive };
  return InsurancePlan.create(planToCreate);
};

// MODIFICAÇÃO AQUI: Esta função agora retorna TODOS os planos, ativos ou inativos.
const getAllInsurancePlans = async () => {
  return InsurancePlan.findAll({
    attributes: ['id', 'name', 'description', 'isActive'], // Adiciona isActive para ser retornado
    order: [['name', 'ASC']],
  });
};

// NOVA FUNÇÃO: Para obter apenas planos de saúde ativos (usada em agendamentos)
const getActiveInsurancePlans = async () => {
  return InsurancePlan.findAll({
    where: { isActive: true },
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

  // O schema de validação para update já lida com isActive como opcional
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
  getAllInsurancePlans, // Esta agora retorna todos
  getActiveInsurancePlans, // Nova função para pegar apenas ativos
  getInsurancePlanById,
  updateInsurancePlan,
  deleteInsurancePlan,
};