// C:\Programacao\Projetos\JavaScript\medgestor-app\backend\server.js

const express = require('express');
const cors = require('cors');
// O require de 'dotenv' no início do arquivo é desnecessário no docker-compose
// onde as variáveis são injetadas. Mantenha-o no config/database se for necessário
// para ambientes locais, mas aqui não é estritamente necessário se database.js
// já lida com isso.

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

// Rota de saúde (acessível em https://api.medgestor.com/health)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Error Handling
app.use(errorMiddleware);

// Exportamos a instância do app para ser usada pelo Supertest nos testes
module.exports = app;

// A lógica de inicialização do servidor real (listen) deve ser executada apenas
// se o arquivo for o ponto de entrada principal, ou seja, se não estiver sendo
// importado por outro módulo (como o Jest).
// Isso garante que o servidor rode no Docker, mesmo com NODE_ENV='test'.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, async () => {
    try {
      await sequelize.authenticate();
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
    } catch (err) {
      console.error('Erro ao conectar ao banco:', err);
      // Em produção, a falha na conexão é fatal.
      process.exit(1);
    }
  });

  // Graceful Shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down server...');
    server.close(() => {
      sequelize.close().then(() => {
        console.log('Database connection closed');
        process.exit(0);
      });
    });
  });
}