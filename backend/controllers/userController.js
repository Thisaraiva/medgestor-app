// backend/controllers/userController.js

const asyncHandler = require('../middleware/controllerMiddleware'); // Importa o asyncHandler
const userService = require('../services/userService'); // Importa o novo userService
const { ValidationError, NotFoundError } = require('../errors/errors'); // Se você tiver essas classes de erro
const Joi = require('joi'); // Importa o Joi

// Schemas de validação Joi
const updateUserSchema = Joi.object({
  name: Joi.string().min(3).messages({
    'string.min': 'Nome deve ter pelo menos 3 caracteres',
  }),
  email: Joi.string().email().messages({
    'string.email': 'Email deve ser válido',
  }),
  role: Joi.string().valid('admin', 'doctor', 'secretary').messages({
    'any.only': 'Role deve ser admin, doctor ou secretary',
  }),
  password: Joi.string().min(6).messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
  }),
  crm: Joi.string().pattern(/^CRM\/[A-Z]{2}-\d{1,6}$/).allow(null).messages({ // Se o campo CRM for para usuários
    'string.pattern.base': 'CRM deve estar no formato CRM/UF-XXXXXX',
  }),
}).min(1); // Garante que pelo menos um campo seja enviado para atualização

const updateMyProfileSchema = Joi.object({
  name: Joi.string().min(3).messages({
    'string.min': 'Nome deve ter pelo menos 3 caracteres',
  }),
  email: Joi.string().email().messages({
    'string.email': 'Email deve ser válido',
  }),
  password: Joi.string().min(6).messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
  }),
}).min(1); // Garante que pelo menos um campo seja enviado para atualização

// Obter todos os usuários
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  res.status(200).json(users);
});

// Obter usuário por ID
exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  if (!user) {
    throw new NotFoundError('Usuário não encontrado.');
  }
  res.status(200).json(user);
});

// Atualizar usuário (por admin/doctor/secretary)
exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = updateUserSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  // Não permitir que um usuário mude o papel de outro para 'admin' sem ser admin
  // Ou que altere o próprio papel para admin se não for
  if (req.body.role && req.body.role !== req.user.role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Você não tem permissão para alterar o papel de outro usuário.' });
  }

  const updatedUser = await userService.updateUser(id, req.body);
  if (!updatedUser) {
    throw new NotFoundError('Usuário não encontrado.');
  }
  res.status(200).json({ message: 'Usuário atualizado com sucesso!', user: updatedUser });
});

// Excluir usuário (por admin/doctor/secretary)
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Impede que o usuário logado exclua a si mesmo através desta rota
  if (req.user.id === id) {
    return res.status(403).json({ message: 'Você não pode excluir seu próprio usuário através desta rota. Use a funcionalidade de desativação ou peça a outro administrador.' });
  }

  // Verifica se o usuário que está sendo excluído é um admin e se o usuário logado não é um admin
  const userToDelete = await userService.getUserById(id);
  if (userToDelete && userToDelete.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Apenas um administrador pode excluir outro administrador.' });
  }

  await userService.deleteUser(id);
  res.status(200).json({ message: 'Usuário excluído com sucesso!' });
});

// Atualizar o próprio perfil (para qualquer usuário autenticado)
exports.updateMyProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = updateMyProfileSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  // Garante que o usuário só pode editar o próprio perfil
  if (req.user.id !== id) {
    throw new ValidationError('Você não tem permissão para editar este perfil.', 403);
  }

  const updatedUser = await userService.updateMyProfile(id, req.body);
  if (!updatedUser) {
    throw new NotFoundError('Usuário não encontrado.');
  }
  res.status(200).json({ message: 'Perfil atualizado com sucesso!', user: updatedUser });
});
