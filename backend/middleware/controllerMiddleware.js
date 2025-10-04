const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next); // <--- MUDANÇA APLICADA

// MUDANÇA: Em vez de tentar tratar e enviar a resposta de erro aqui,
// simplesmente passamos o erro para o próximo middleware, que será o errorMiddleware.js.
// Isso garante que toda a lógica de tratamento e tradução de erros
// (incluindo SequelizeUniqueConstraintError) seja centralizada no errorMiddleware,
// seguindo o princípio da Responsabilidade Única (SRP).

module.exports = asyncHandler;