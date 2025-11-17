'use strict';
// Removido: const { v4: uuidv4 } = require('uuid'); - Usamos IDs fixos para idempotência.

// Definindo IDs fixos para garantir a previsibilidade e evitar conflitos.
const UNIMED_ID = '2c82f93e-2b1b-4d4a-9c7a-5f3e4b7d1a5c';
const BRADESCO_ID = 'a7d1b3f9-7e5d-4a1b-9c8e-2f0c1d6e5a4b';
const AMIL_ID = 'e0c3a8b2-4d7f-4c5e-8b0a-9f1e3c2d6a7b';
const HAPVIDA_ID = '5f4d1e0c-3b2a-4c9e-8d7a-1b2c3d4e5f6a';


module.exports = {
  /**
   * Aplica os seeds de planos de saúde.
   * Adicionado 'Sequelize' como segundo argumento por convenção, 
   * embora não seja usado diretamente no 'up'.
   */
  async up(queryInterface, _Sequelize) { // <-- Adicionado Sequelize aqui para consistência
    const tableName = 'insurance_plans';
    console.log(`Aplicando seeds de planos de saúde na tabela ${tableName} usando ON CONFLICT (name) DO UPDATE...`);

    const insurancePlans = [
      {
        id: UNIMED_ID,
        name: 'Unimed',
        description: 'Plano de saúde Unimed',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: BRADESCO_ID,
        name: 'Bradesco Saúde',
        description: 'Plano de saúde Bradesco',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: AMIL_ID,
        name: 'Amil',
        description: 'Plano de saúde Amil',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: HAPVIDA_ID,
        name: 'Hapvida',
        description: 'Plano de saúde Hapvida',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    try {
      // CORREÇÃO ESSENCIAL: O conflito é verificado no campo 'name',
      // e o 'id' é atualizado com o valor fixo no 'DO UPDATE'.
      for (const plan of insurancePlans) {
        await queryInterface.sequelize.query(`
                INSERT INTO "${tableName}" (id, name, description, "isActive", "createdAt", "updatedAt") 
                VALUES (:id, :name, :description, :isActive, :createdAt, :updatedAt)
                ON CONFLICT (name) DO UPDATE
                  SET 
                    id = EXCLUDED.id, -- Garante que o ID fixo seja aplicado ao registro existente
                    description = EXCLUDED.description,
                    "isActive" = EXCLUDED."isActive",
                    "updatedAt" = EXCLUDED."updatedAt";`, {
          replacements: plan,
          type: queryInterface.sequelize.QueryTypes.INSERT
        });
      }
      console.log(`Seeds de Planos de Saúde aplicados com sucesso na tabela ${tableName}.`);
    } catch (error) {
      // Manteve-se o log de erro detalhado para diagnosticar problemas de migration
      console.error('--------------------------------------------------');
      console.error('[SEEDER ERROR DETALHADO] Falha ao inserir planos de saúde. Verifique se a coluna NAME possui um índice UNIQUE.');
      console.error('Detalhes do Erro:', error.message);
      console.error('--------------------------------------------------');
      throw error;
    }
  },

  /**
   * Remove os seeds aplicados.
   */
  async down(queryInterface, Sequelize) { // <-- CORREÇÃO PRINCIPAL: Recebe Sequelize como segundo argumento
    const fixedIds = [UNIMED_ID, BRADESCO_ID, AMIL_ID, HAPVIDA_ID];
    // CORREÇÃO: Obter o objeto Op diretamente do argumento Sequelize
    const { Op } = Sequelize;

    // Remove apenas os planos com os IDs fixos.
    await queryInterface.bulkDelete('insurance_plans', {
      id: { [Op.in]: fixedIds }
    }, {});
  },
};