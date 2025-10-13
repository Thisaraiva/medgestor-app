// backend/controllers/userController.js (COMPLETO)

const asyncHandler = require('../middleware/controllerMiddleware'); 
const userService = require('../services/userService'); 
const { ValidationError, NotFoundError, ForbiddenError } = require('../errors/errors'); // Adicionar ForbiddenError
const Joi = require('joi'); 

// Schemas de validação Joi (Inalterados)
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
  crm: Joi.string().pattern(/^CRM\/[A-Z]{2}-\d{1,6}$/).allow(null).messages({ 
    'string.pattern.base': 'CRM deve estar no formato CRM/UF-XXXXXX',
  }),
}).min(1); 

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
}).min(1); 


exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  res.status(200).json(users);
});


exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  if (!user) {
    throw new NotFoundError('Usuário não encontrado.');
  }
  res.status(200).json(user);
});

// Atualizar usuário (por admin/doctor/secretary) - Rota de Gerenciamento
exports.updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = updateUserSchema.validate(req.body);
    if (error) {
        throw new ValidationError(error.details[0].message);
    }
    
    // 1. Prevenção: Não permitir que o usuário logado se atualize nesta rota
    if (req.user.id === id) {
        throw new ForbiddenError('Você não pode se atualizar através desta rota de gerenciamento. Use /profile/:id.');
    }

    // 2. Regra de Negócio: Permissão para alterar o ROLE
    // Apenas administradores podem alterar o role de qualquer um.
    if (req.body.role && req.user.role !== 'admin') {
        // **CORREÇÃO DRY/SOLID:** Usando o ForbiddenError
        throw new ForbiddenError('Apenas administradores podem alterar o papel de outros usuários.'); 
        // Linha ANTERIOR: return res.status(403).json({ message: 'Apenas administradores podem alterar o papel de outros usuários.' });
    }

    const updatedUser = await userService.updateUser(id, req.body);
    if (!updatedUser) {
        throw new NotFoundError('Usuário não encontrado.');
    }
    res.status(200).json({ message: 'Usuário atualizado com sucesso!', user: updatedUser });
});

exports.deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    if (req.user.id === id) {
        // **CORREÇÃO DRY/SOLID:** Usando o ForbiddenError
        throw new ForbiddenError('Você não pode excluir seu próprio usuário através desta rota. Use a funcionalidade de desativação ou peça a outro administrador.'); 
        // Linha ANTERIOR: return res.status(403).json({ message: 'Você não pode excluir seu próprio usuário através desta rota. Use a funcionalidade de desativação ou peça a outro administrador.' });
    }
    
    const userToDelete = await userService.getUserById(id);
    if (userToDelete && userToDelete.role === 'admin' && req.user.role !== 'admin') {
        // **CORREÇÃO DRY/SOLID:** Usando o ForbiddenError
        throw new ForbiddenError('Apenas um administrador pode excluir outro administrador.');
        // Linha ANTERIOR: return res.status(403).json({ message: 'Apenas um administrador pode excluir outro administrador.' });
    }

    await userService.deleteUser(id);
    res.status(200).json({ message: 'Usuário excluído com sucesso!' });
});

exports.updateMyProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = updateMyProfileSchema.validate(req.body);
    if (error) {
        throw new ValidationError(error.details[0].message);
    }

    // Garante que o usuário só pode editar o próprio perfil (LSP)
    if (req.user.id !== id) {
        // CORREÇÃO SOLID: Lança ForbiddenError para status 403
        throw new ForbiddenError('Você não tem permissão para editar este perfil.'); 
    }
    
    // Prevenção: Impedir alteração de Role por meio desta rota de perfil
    if (req.body.role) {
        throw new ForbiddenError('A alteração de papel (role) não é permitida na rota de atualização de perfil.');
    }

    const updatedUser = await userService.updateMyProfile(id, req.body);
    if (!updatedUser) {
        throw new NotFoundError('Usuário não encontrado.');
    }
    res.status(200).json({ message: 'Perfil atualizado com sucesso!', user: updatedUser });
});