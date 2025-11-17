const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');
const moment = require('moment');

const JANE_DOE_PATIENT_ID = '11111111-1111-4111-9111-111111111111'; // ID fixo para Jane Doe (Padrão do Seed)

module.exports = {
  JANE_DOE_PATIENT_ID, // Exportar o ID fixo (DRY)

  up: async (queryInterface) => {
    // ... (Funções generateValidCPF e generateDateOfBirth inalteradas) ...
    function generateValidCPF() {
      // ... (código da função) ...
      const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
      const calculateCheckDigit = (digits, start, length) => {
        let sum = 0;
        for (let i = 0; i < length; i++) {
          sum += digits[i] * (start - i);
        }
        const remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
      };
      digits.push(calculateCheckDigit(digits, 10, 9));
      digits.push(calculateCheckDigit(digits, 11, 10));
      const cpfRaw = digits.join('');
      return `${cpfRaw.slice(0, 3)}.${cpfRaw.slice(3, 6)}.${cpfRaw.slice(6, 9)}-${cpfRaw.slice(9, 11)}`;
    }

    const generateDateOfBirth = () => {
      const date = faker.date.past({ years: 90, refDate: moment().subtract(18, 'years').toDate() });
      return moment(date).format('YYYY-MM-DD');
    };
    
    const fixedPatient = {
      id: JANE_DOE_PATIENT_ID, // UUID Fixo
      name: 'Jane Doe',
      cpf: '123.456.789-09',
      dateOfBirth: '1990-05-15',
      email: 'patient@medgestor.com',
      phone: '(11) 91234-5678',
      allergies: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
        
        console.log('Aplicando seed de paciente fixo com ON CONFLICT (id) DO UPDATE...');
        
        // Insere ou atualiza (Upsert) baseado no ID fixo
        await queryInterface.sequelize.query(`
            INSERT INTO "patients" (id, name, cpf, "dateOfBirth", email, phone, allergies, "createdAt", "updatedAt") 
            VALUES (:id, :name, :cpf, :dateOfBirth, :email, :phone, :allergies, :createdAt, :updatedAt)
            ON CONFLICT (id) DO UPDATE
            SET 
                name = EXCLUDED.name,
                cpf = EXCLUDED.cpf,
                "dateOfBirth" = EXCLUDED."dateOfBirth",
                email = EXCLUDED.email,
                phone = EXCLUDED.phone,
                allergies = EXCLUDED.allergies,
                "updatedAt" = EXCLUDED."updatedAt";
        `, {
            replacements: fixedPatient,
            type: queryInterface.sequelize.QueryTypes.INSERT
        });
    } else {
        // Ambiente de Teste: Mantém o bulkDelete/bulkInsert
        await queryInterface.bulkDelete('patients', null, {});
        // Inserir o paciente fixo primeiro
        await queryInterface.bulkInsert('patients', [fixedPatient], {});
    }


    // Seed de pacientes aleatórios (sempre cria novos, pois não possuem IDs fixos)
    const randomPatients = Array.from({ length: 4 }, () => ({
      id: uuidv4(),
      name: faker.person.fullName(),
      cpf: generateValidCPF(),
      dateOfBirth: generateDateOfBirth(),
      email: faker.internet.email(),
      phone: faker.phone.number('(##) #####-####'),
      allergies: faker.helpers.arrayElement(['Penicilina', 'Amendoim', 'Látex', null]),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('patients', randomPatients, {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('patients', null, {});
  },
};