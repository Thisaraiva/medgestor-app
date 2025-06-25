const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');

router.post('/register', authMiddleware, restrictTo('admin', 'doctor'), authController.register);
router.post('/login', authController.login);

module.exports = router;