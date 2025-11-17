'use strict';
// Removido: const { v4: uuidv4 } = require('uuid'); - Usaremos IDs fixos para idempotência.

// Definindo IDs fixos para garantir a previsibilidade e evitar conflitos.
const UNIMED_ID = '2c82f93e-2b1b-4d4a-9c7a-5f3e4b7d1a5c';
const BRADESCO_ID = 'a7d1b3f9-7e5d-4a1b-9c8e-2f0c1d6e5a4b';
const AMIL_ID = 'e0c3a8b2-4d7f-4c5e-8b0a-9f1e3c2d6a7b';
const HAPVIDA_ID = '5f4d1e0c-3b2a-4c9e-8d7a-1b2c3d4e5f6a';


module.exports = {
  /**
   * Aplica os seeds de planos de saúde.
   * Usamos IDs fixos e uma consulta SQL explícita ON CONFLICT DO UPDATE
   * para garantir que a operação seja totalmente idempotente.
   */
  async up(queryInterface) {
    const tableName = 'insurance_plans';
    console.log(`Aplicando seeds de planos de saúde na tabela ${tableName} usando ON CONFLICT DO UPDATE...`);

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
        // Itera sobre cada plano e executa o Upsert (Insert ou Update) com SQL puro,
        // garantindo que não haja erros de chave duplicada baseados no ID.
        for (const plan of insurancePlans) {
            await queryInterface.sequelize.query(`
                INSERT INTO "${tableName}" (id, name, description, "isActive", "createdAt", "updatedAt") 
                VALUES (:id, :name, :description, :isActive, :createdAt, :updatedAt)
                ON CONFLICT (id) DO UPDATE
                SET 
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    "isActive" = EXCLUDED."isActive",
                    "updatedAt" = EXCLUDED."updatedAt";
            `, {
                replacements: plan,
                type: queryInterface.sequelize.QueryTypes.INSERT
            });
        }
        console.log(`Seeds de Planos de Saúde aplicados com sucesso na tabela ${tableName}.`);
    } catch (error) {
        // Log detalhado para o ambiente de teste
        console.error('--------------------------------------------------');
        console.error('[SEEDER ERROR DETALHADO] Falha ao inserir planos de saúde. Verifique se a coluna ID é UUID e se a tabela existe.');
        console.error('Detalhes do Erro:', error.message);
        console.error('--------------------------------------------------');
        // Re-lança o erro para garantir que o Jest/test_setup detecte a falha
        throw error;
    }
  },

  /**
   * Remove os seeds aplicados.
   */
  async down(queryInterface) {
    // Definir os IDs fixos para o down para exclusão seletiva, garantindo que apenas 
    // os registros criados pelo seeder sejam removidos.
    const fixedIds = [UNIMED_ID, BRADESCO_ID, AMIL_ID, HAPVIDA_ID];
    const Op = queryInterface.Sequelize.Op;

    await queryInterface.bulkDelete('insurance_plans', {
        id: { [Op.in]: fixedIds }
    }, {});
  },
};