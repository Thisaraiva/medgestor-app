// C:\Programacao\Projetos\JavaScript\medgestor-app\backend\server.js

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

// ----------------------------------------------------
// CORREÇÃO ESSENCIAL: Configuração CORS Explícita
// ----------------------------------------------------

// Origens permitidas (incluindo HTTPS de produção e HTTP local)
const allowedOrigins = [
  'https://medgestor-frontend-node.onrender.com/',
  'http://localhost:3000', // Porta padrão do React local
  'http://localhost:5000', // Caso teste o frontend e backend juntos via Docker
];

const corsOptions = {
  origin: (origin, callback) => {
    // Permite requisições sem 'origin' (como apps móveis, cURL, ou local)
    // E também permite as origens da nossa lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Se a origem não estiver na lista, bloqueia
      callback(new Error(`Not allowed by CORS for origin: ${origin}`));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Necessário para cookies/sessões, embora você use JWT
  optionsSuccessStatus: 204
};

// Aplica o middleware CORS configurado
app.use(cors(corsOptions));

// ----------------------------------------------------

// Middleware
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