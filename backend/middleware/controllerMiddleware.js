const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) =>
    res.status(err.status || 400).json({ error: err.message })
  );

module.exports = asyncHandler;