const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');
const moment = require('moment'); // Adicionado moment para gerar datas de nascimento

module.exports = {
  up: async (queryInterface) => {
    // Função para gerar CPF válido (mantida a lógica como no seu código original)
    function generateValidCPF() {
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

    // Função auxiliar para gerar uma data de nascimento válida (AAAA-MM-DD)
    const generateDateOfBirth = () => {
      // Gera uma data entre 18 e 90 anos atrás
      const date = faker.date.past({ years: 90, refDate: moment().subtract(18, 'years').toDate() });
      return moment(date).format('YYYY-MM-DD');
    };

    const patients = [
      {
        id: uuidv4(),
        name: 'Jane Doe',
        cpf: '123.456.789-09', // CPF válido
        dateOfBirth: '1990-05-15', // Exemplo de data de nascimento
        email: 'patient@medgestor.com',
        phone: '(11) 91234-5678',
        allergies: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      ...Array.from({ length: 4 }, () => ({
        id: uuidv4(),
        name: faker.person.fullName(),
        cpf: generateValidCPF(),
        dateOfBirth: generateDateOfBirth(), // Data de nascimento aleatória
        email: faker.internet.email(),
        phone: faker.phone.number('(##) #####-####'),
        allergies: faker.helpers.arrayElement(['Penicilina', 'Amendoim', 'Látex', null]),
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    ];

    await queryInterface.bulkInsert('patients', patients, {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('patients', null, {});
  },
};