const express = require('express');
const router = express.Router();
const { createRecord, getRecordsByPatient, getRecordById } = require('../controllers/recordController');
const { authMiddleware, restrictTo } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, restrictTo('doctor'), createRecord);
router.get('/patient/:patientId', authMiddleware, restrictTo(['doctor', 'secretary']), getRecordsByPatient);
router.get('/:id', authMiddleware, restrictTo(['doctor', 'secretary']), getRecordById);

module.exports = router;