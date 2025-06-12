const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const recordRoutes = require('./routes/recordRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Error Handling
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

// Database Connection and Sync
sequelize.authenticate()
  .then(() => {
    console.log('Conexão com PostgreSQL estabelecida');
    //return sequelize.sync({ alter: false });
  })
  .then(() => {
    console.log('Database synced');
    app.listen(5000, () => {
      console.log('Server running on port 5000');
    });
  })
  .catch(err => {
    console.error('Erro ao conectar ou sincronizar o banco:', err);
  });