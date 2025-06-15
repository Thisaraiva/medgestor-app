const asyncHandler = require('../middleware/controllerMiddleware');
const recordService = require('../services/recordService');
const Joi = require('joi');

const createSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  diagnosis: Joi.string().allow(null),
  treatment: Joi.string().allow(null),
  notes: Joi.string().allow(null),
});

const createRecord = asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) {
    throw new Error(error.details[0].message);
  }

  const record = await recordService.createRecord(value);
  res.status(201).json(record);
});

const getRecordsByPatient = asyncHandler(async (req, res) => {
  const records = await recordService.getRecordsByPatient(req.params.patientId);
  res.json(records);
});

module.exports = { createRecord, getRecordsByPatient };