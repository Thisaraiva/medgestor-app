const authService = require('../services/authService');
     const { User } = require('../models');
     const bcrypt = require('bcryptjs');
     const { generateToken } = require('../utils/jwt');
     jest.mock('../models');
     jest.mock('../utils/jwt');

     describe('Auth Service', () => {
       it('should register a new user', async () => {
         const userData = {
           name: 'Test User',
           email: 'test@example.com',
           password: 'pass123',
           role: 'doctor',
           crm: 'CRM/SP-123456',
         };
         User.findOne.mockResolvedValue(null);
         User.create.mockResolvedValue({ id: '123', ...userData });
         generateToken.mockReturnValue('token');
         const result = await authService.register(userData);
         expect(result.user.email).toBe('test@example.com');
         expect(result.token).toBe('token');
       });

       it('should login with valid credentials', async () => {
         const user = { id: '123', email: 'test@example.com', password: 'hashed', role: 'doctor' };
         User.findOne.mockResolvedValue(user);
         bcrypt.compare.mockResolvedValue(true);
         generateToken.mockReturnValue('token');
         const result = await authService.login({ email: 'test@example.com', password: 'pass123' });
         expect(result.user.email).toBe('test@example.com');
         expect(result.token).toBe('token');
       });
     });