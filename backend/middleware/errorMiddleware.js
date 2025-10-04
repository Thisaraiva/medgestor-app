// C:\Programacao\Projetos\JavaScript\medgestor-app\backend\middleware\errorMiddleware.js

const { NotFoundError, ValidationError } = require('../errors/errors');
const {
  ValidationError: SequelizeValidationError,
  UniqueConstraintError: SequelizeUniqueConstraintError,
  DatabaseError: SequelizeDatabaseError
} = require('sequelize');

// A assinatura deve ser (err, req, res, next), mas podemos usar _next para evitar o warning do ESLint
const errorMiddleware = (err, req, res, _next) => {
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Erro interno do servidor';
  let errors = [];

  // 1. Tratamento de Erros de Domínio
  if (err instanceof NotFoundError) {
    statusCode = 404;
  } else if (err instanceof ValidationError) {
    // Erro de validação Joi OU Erro de Regra de Negócio customizado (e.g., data passada)
    statusCode = 400;
  }

  // 2. Tratamento de Erros do Sequelize
  // B. Erro de Restrição Única (CPF/Email duplicado)
  else if (err instanceof SequelizeUniqueConstraintError) { // 'else if' para evitar reatribuição de statusCode
    statusCode = 400;
    const field = err.errors[0]?.path || Object.keys(err.fields || {})[0] || 'campo';
    const normalizedField = field.toLowerCase();

    if (normalizedField.includes('cpf')) {
      message = 'O **CPF** fornecido já está registrado para outro paciente.';
    } else if (normalizedField.includes('email')) {
      message = 'O **e-mail** fornecido já está registrado para outro paciente.';
    } else {
      message = `Erro de duplicação: O valor para o campo '${field}' já existe.`;
    }
    errors = err.errors.map(e => e.message);
  }

  // A. Erro de Validação de Dados do Sequelize
  else if (err instanceof SequelizeValidationError) {
    statusCode = 400;
    message = err.errors[0]?.message || 'Erro de validação de dados. Verifique os campos preenchidos.';
    errors = err.errors.map(e => e.message);
  }

  // C. Outros Erros de Banco de Dados
  else if (err instanceof SequelizeDatabaseError && statusCode === 500) {
    message = 'Erro de banco de dados. Tente novamente mais tarde.';
    console.error('[Sequelize DB Error]', err.message);
  }

  // Log e Resposta Final
  if (statusCode >= 500) {
    console.error(err);
  } else {
    console.log(`[Client Error - ${statusCode}]: ${message}`);
  }

  // Resposta Final no formato JSON: { error: "Mensagem Amigável" }
  res.status(statusCode).json({
    error: message,
    errors: errors.length > 0 ? errors : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorMiddleware;