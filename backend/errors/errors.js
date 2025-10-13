// C:\Programacao\Projetos\JavaScript\medgestor-app\backend\errors\errors.js

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

// **CORREÇÃO:** Adicionando a classe ForbiddenError (Status 403)
class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
    this.status = 403; // Código 403 para Acesso Negado/Proibido
  }
}

// **MELHORIA/BOA PRÁTICA:** Adicionando UnprocessableEntityError (Status 422)
// Útil para validações de regra de negócio mais complexas no futuro.
class UnprocessableEntityError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnprocessableEntityError';
    this.status = 422;
  }
}

module.exports = { 
    NotFoundError, 
    ValidationError, 
    ForbiddenError, 
    UnprocessableEntityError 
};