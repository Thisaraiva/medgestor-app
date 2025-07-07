const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const insurancePlanRoutes = require('./routes/insurancePlanRoutes');
const recordRoutes = require('./routes/recordRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const userRoutes = require('./routes/userRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/insurance-plans', insurancePlanRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/users', userRoutes);

// Error Handling
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

// Graceful Shutdown
const server = app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV === 'test') {
      //await sequelize.sync({ force: true });
    }
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.error('Erro ao conectar ao banco:', err);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  server.close(() => {
    sequelize.close().then(() => {
      console.log('Database connection closed');
      process.exit(0);
    });
  });
});