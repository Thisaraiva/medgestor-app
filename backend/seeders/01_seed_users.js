'use strict';
const bcryptjs = require('bcryptjs');
const { faker } = require('@faker-js/faker');
// Importa o modelo User para usar o upsert
//const { User } = require('../models'); 

// Definir UUIDs fixos (Centralizados)
const ADMIN_USER_ID = '00000000-0000-4000-8000-000000000001';
const DOCTOR_USER_ID = '00000000-0000-4000-8000-000000000002'; // ID do Doutor padrão do Seed
const SECRETARY_USER_ID = '00000000-0000-4000-8000-000000000003';

// Exportamos os IDs para serem usados no test_setup.js e outras seeds (DRY)
module.exports = {
  ADMIN_USER_ID,
  DOCTOR_USER_ID,
  SECRETARY_USER_ID,

  async up(queryInterface) {
    // REMOVEMOS O bulkDelete. Se o banco de produção tiver dados, não queremos apagá-los.
    // await queryInterface.bulkDelete('users', null, {}); 

    // Obter senha do ambiente ou usar padrão
    const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || 'pass123';
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(defaultPassword, salt);

    const fixedUsers = [
      {
        id: ADMIN_USER_ID,
        name: 'Admin',
        email: 'admin@medgestor.com',
        password: hashedPassword,
        role: 'admin',
        crm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: DOCTOR_USER_ID,
        name: 'Dr. John Smith',
        email: 'doctor@medgestor.com',
        password: hashedPassword,
        role: 'doctor',
        crm: `CRM/SP-${faker.string.numeric(6)}`, 
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: SECRETARY_USER_ID,
        name: 'Secretary User', // Nomes fixos são melhores para ambientes de CI/CD
        email: 'secretary@medgestor.com', // Email fixo para idempotência
        password: hashedPassword,
        role: 'secretary',
        crm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // 1. Usar bulkInsert com opção de ignorar (para PostgreSQL é mais complexo)
    // A maneira mais simples no Sequelize CLI é fazer a verificação manualmente ou usar o upsert.
    // Usaremos a lógica de DELETE/INSERT apenas para os ambientes que a permitem (como TESTE, que tem cleanup)
    // Para produção, vamos usar upsert (update or insert) para garantir a idempotência dos 3 usuários cruciais.
    
    // ATENÇÃO: O 'upsert' no Sequelize CLI `db:seed:all` é complicado, pois não temos acesso direto ao modelo.
    // A MELHOR SOLUÇÃO é USAR SOMENTE `queryInterface.bulkInsert` E REMOVER `db:seed:all` DO START COMMAND DO RENDER.
    
    // NO ENTANTO, se você *precisa* rodar seeds em todo deploy, vamos adotar o `sequelize.query` com INSERT INTO ... ON CONFLICT (id) DO NOTHING
    
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
        
        console.log('Aplicando seeds de usuários com ON CONFLICT (id) DO UPDATE...');

        for (const user of fixedUsers) {
            // Insere ou atualiza (Upsert) baseado no ID fixo
            await queryInterface.sequelize.query(`
                INSERT INTO "users" (id, name, email, password, role, crm, "createdAt", "updatedAt") 
                VALUES (:id, :name, :email, :password, :role, :crm, :createdAt, :updatedAt)
                ON CONFLICT (id) DO UPDATE
                SET 
                    name = EXCLUDED.name,
                    email = EXCLUDED.email,
                    password = EXCLUDED.password,
                    role = EXCLUDED.role,
                    crm = EXCLUDED.crm,
                    "updatedAt" = EXCLUDED."updatedAt";
            `, {
                replacements: user,
                type: queryInterface.sequelize.QueryTypes.INSERT
            });
        }
    } else {
        // Ambiente de Teste: Mantém o bulkDelete/bulkInsert, pois o DB de teste é recriado
        await queryInterface.bulkDelete('users', null, {}); 
        await queryInterface.bulkInsert('users', fixedUsers, {});
    }

    // Se houver necessidade de dados aleatórios adicionais (não cruciais), use bulkInsert:
    const randomUsers = Array.from({ length: 2 }, () => ({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email({ provider: 'medgestor.com' }),
        password: hashedPassword,
        role: faker.helpers.arrayElement(['doctor', 'secretary']),
        crm: faker.helpers.arrayElement(['doctor', 'secretary']) === 'doctor' ? `CRM/RJ-${faker.string.numeric(6)}` : null,
        createdAt: new Date(),
        updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('users', randomUsers, {});

  },

  async down(queryInterface) {
    // Mantém o down para limpar todos os users
    await queryInterface.bulkDelete('users', null, {});
  },
};