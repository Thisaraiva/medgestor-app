const { User } = require('../models');
const sequelize = require('../config/database');

describe('User Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  it('should create a user', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
      role: 'doctor',
    });
    expect(user.name).toBe('Test User');
  });
});