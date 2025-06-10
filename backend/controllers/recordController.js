const recordService = require('../services/recordService');

const createRecord = async (req, res) => {
  try {
    const record = await recordService.createRecord(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getRecordsByPatient = async (req, res) => {
  try {
    const records = await recordService.getRecordsByPatient(req.params.patientId);
    res.json(records);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createRecord, getRecordsByPatient };