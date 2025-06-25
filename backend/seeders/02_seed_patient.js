const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');

module.exports = {
  up: async (queryInterface) => {
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

    const patients = [
      {
        id: uuidv4(),
        name: 'Jane Doe',
        cpf: '123.456.789-09', // CPF válido
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