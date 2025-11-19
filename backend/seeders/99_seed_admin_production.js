'use strict';
const ADMIN_EMAIL = 'admin@medgestor.com';
const ADMIN_ID = '00000000-0000-4000-8000-000000000001'; // <-- Usar o ID fixo do 01_seed_users para consistência

module.exports = {
  up: async (queryInterface) => {
    // Obter senha do ambiente ou usar padrão
    const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || 'pass123';
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(defaultPassword, 10);
    
    // Dados do usuário Admin
    const adminUser = {
        id: ADMIN_ID,
        name: 'Administrador',
        email: ADMIN_EMAIL,
        password: hash,
        role: 'admin',
        crm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    
    // **Torna o Seed Idempotente (Upsert usando ON CONFLICT)**
    console.log(`Verificando e garantindo o usuário Admin (${ADMIN_EMAIL}) via ON CONFLICT...`);

    await queryInterface.sequelize.query(`
        INSERT INTO "users" (id, name, email, password, role, crm, "createdAt", "updatedAt") 
        VALUES (:id, :name, :email, :password, :role, :crm, :createdAt, :updatedAt)
        ON CONFLICT (id) DO UPDATE
        SET 
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            role = EXCLUDED.role,
            "updatedAt" = EXCLUDED."updatedAt";
    `, {
        replacements: adminUser,
        type: queryInterface.sequelize.QueryTypes.INSERT
    });
  },

  down: async (queryInterface, _Sequelize) => {
    // Limpar o Admin apenas pelo email
    await queryInterface.bulkDelete('users', { email: ADMIN_EMAIL });
  }
};