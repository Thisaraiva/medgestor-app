const express = require('express');
const cors = require('cors');
const errorMiddleware = require('../middleware/errorMiddleware');

const createTestServer = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', require('../routes/authRoutes'));
  app.use('/api/patients', require('../routes/patientRoutes'));
  app.use('/api/appointments', require('../routes/appointmentRoutes'));
  app.use('/api/records', require('../routes/recordRoutes'));
  app.use('/api/prescriptions', require('../routes/prescriptionRoutes'));
  app.use(errorMiddleware);
  return app;
};

module.exports = { createTestServer };