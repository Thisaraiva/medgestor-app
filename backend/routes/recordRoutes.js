const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');
const { param } = require('express-validator');

const validate = (req, res, next) => {
  const errors = req.getValidationResult();
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/', authMiddleware, restrictTo('doctor'), recordController.createRecord);
router.get(
  '/patient/:patientId',
  authMiddleware,
  [param('patientId').isUUID().withMessage('Patient ID must be a valid UUID')],
  validate,
  recordController.getRecordsByPatient
);

module.exports = router;