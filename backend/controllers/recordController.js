const asyncHandler = require('../middleware/controllerMiddleware');
const recordService = require('../services/recordService');
const { ValidationError } = require('../errors/errors');
const Joi = require('joi');

const createSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  diagnosis: Joi.string().min(1).required(),
  treatment: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, ''),
  date: Joi.date().iso().required(),
});

const createRecord = asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const record = await recordService.createRecord(value);
  res.status(201).json(record);
});

const getRecordsByPatient = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const records = await recordService.getRecordsByPatient(req.params.patientId, { date });
  res.status(200).json(records);
});

const getRecordById = asyncHandler(async (req, res) => {
  const record = await recordService.getRecordById(req.params.id);
  res.status(200).json(record);
});

module.exports = { createRecord, getRecordsByPatient, getRecordById };