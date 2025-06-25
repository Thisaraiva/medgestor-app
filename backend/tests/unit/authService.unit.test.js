const { register, login } = require('../../services/authService');
const { User } = require('../../models');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../../utils/jwt');
const { ValidationError } = require('../../errors/errors');

jest.mock('../../models');
jest.mock('bcryptjs');
jest.mock('../../utils/jwt');

describe('Auth Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a doctor successfully', async () => {
      const mockData = {
        name: 'Dr. John',
        email: 'john@example.com',
        password: 'password123',
        role: 'doctor',
        crm: 'CRM/SP-123456',
      };
      const mockUser = {
        id: '30ba4d08-73a1-4b3e-a63d-558d91fd5cbb',
        name: mockData.name,
        email: mockData.email,
        role: mockData.role,
        crm: mockData.crm,
      };
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue(mockUser);
      generateToken.mockReturnValue('mockToken');

      const result = await register(mockData);
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          crm: mockUser.crm,
        },
        token: 'mockToken',
      });
      expect(User.create).toHaveBeenCalledWith({
        name: mockData.name,
        email: mockData.email,
        password: 'hashedPassword',
        role: mockData.role,
        crm: mockData.crm,
      });
    });

    it('should register a secretary without CRM', async () => {
      const mockData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'secretary',
      };
      const mockUser = {
        id: '40ca5e09-84b2-5c4e-a74e-669e02ge6dcc',
        name: mockData.name,
        email: mockData.email,
        role: mockData.role,
        crm: null,
      };
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue(mockUser);
      generateToken.mockReturnValue('mockToken');

      const result = await register(mockData);
      expect(result.user.crm).toBeNull();
      expect(User.create).toHaveBeenCalledWith({
        name: mockData.name,
        email: mockData.email,
        password: 'hashedPassword',
        role: mockData.role,
        crm: null,
      });
    });

    it('should throw ValidationError for existing email', async () => {
      const mockData = {
        name: 'Dr. John',
        email: 'john@example.com',
        password: 'password123',
        role: 'doctor',
        crm: 'CRM/SP-123456',
      };
      User.findOne.mockResolvedValue({ email: mockData.email });
      await expect(register(mockData)).rejects.toThrow(
        new ValidationError('Email já registrado')
      );
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const mockData = {
        email: 'john@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: '270afe3e-e340-43ef-ac6d-3da9a89ab3d4',
        name: 'Dr. John',
        email: mockData.email,
        password: 'hashedPassword',
        role: 'doctor',
        crm: 'CRM/SP-123456',
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      generateToken.mockReturnValue('mockToken');

      const result = await login(mockData);
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          crm: mockUser.crm,
        },
        token: 'mockToken',
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(mockData.password, mockUser.password);
    });

    it('should throw ValidationError for invalid email', async () => {
      const mockData = {
        email: 'john@example.com',
        password: 'password123',
      };
      User.findOne.mockResolvedValue(null);
      await expect(login(mockData)).rejects.toThrow(
        new ValidationError('Email ou senha inválidos')
      );
    });

    it('should throw ValidationError for invalid password', async () => {
      const mockData = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };
      const mockUser = {
        email: mockData.email,
        password: 'hashedPassword',
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      await expect(login(mockData)).rejects.toThrow(
        new ValidationError('Email ou senha inválidos')
      );
    });
  });
});