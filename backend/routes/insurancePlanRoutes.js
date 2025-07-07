const express = require('express');
const router = express.Router();
const insurancePlanController = require('../controllers/insurancePlanController');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { param, validationResult } = require('express-validator');

// Validation middleware for Express-Validator
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Routes for Insurance Plans
// POST /api/insurance-plans - Creates a new plan (Admin only)
router.post('/', authMiddleware, restrictTo('admin', 'secretary'), insurancePlanController.createInsurancePlan);

// GET /api/insurance-plans - Gets all active plans (all authenticated users)
router.get('/', authMiddleware, insurancePlanController.getAllInsurancePlans);

// GET /api/insurance-plans/:id - Gets a plan by ID (all authenticated users)
router.get(
  '/:id',
  authMiddleware,
  [param('id').isUUID().withMessage('Plan ID must be a valid UUID')],
  validate,
  insurancePlanController.getInsurancePlanById
);

// PUT /api/insurance-plans/:id - Updates a plan (Admin only)
router.put(
  '/:id',
  authMiddleware,
  restrictTo('admin', 'secretary'),
  [param('id').isUUID().withMessage('Plan ID must be a valid UUID')],
  validate,
  insurancePlanController.updateInsurancePlan
);

// DELETE /api/insurance-plans/:id - Deletes a plan (Admin only)
router.delete(
  '/:id',
  authMiddleware,
  restrictTo('admin', 'secretary'),
  [param('id').isUUID().withMessage('Plan ID must be a valid UUID')],
  validate,
  insurancePlanController.deleteInsurancePlan
);

module.exports = router;
