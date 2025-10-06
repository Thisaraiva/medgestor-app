const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
//const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');

//router.post('/register', authMiddleware, restrictTo('admin', 'doctor', 'secretary'), authController.register);
router.post('/register', authController.register); // CORRIGIDO: Removida a proteção.
router.post('/login', authController.login);


module.exports = router;