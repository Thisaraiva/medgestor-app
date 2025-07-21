// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import UserFormPage from './pages/UserFormPage';
import PatientList from './pages/PatientList';
import PatientFormPage from './pages/PatientFormPage';
import AppointmentList from './pages/AppointmentList'; // Importa a nova página de lista de agendamentos
import AppointmentFormPage from './pages/AppointmentFormPage'; // Importa a nova página de formulário de agendamentos
import InsurancePlanListPage from './pages/InsurancePlanList'; // NOVO: Importa a lista de planos
import InsurancePlanFormPage from './pages/InsurancePlanFormPage'; // NOVO: Importa o formulário de planos


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rota de Login (pública) */}
          <Route path="/" element={<Login />} />

          {/* Rotas Protegidas */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Rotas de Gerenciamento de Usuários (apenas para admin, doctor, secretary) */}
          <Route element={<PrivateRoute roles={['admin', 'doctor', 'secretary']} />}>
            <Route path="/users" element={<UserManagement />} />
            <Route path="/users/new" element={<UserFormPage />} />
            <Route path="/users/edit/:id" element={<UserFormPage />} />
            <Route path="/register" element={<UserFormPage />} /> {/* Rota para registro de novo usuário */}
          </Route>

          {/* Rotas de Gerenciamento de Pacientes (apenas para admin, doctor, secretary) */}
          <Route element={<PrivateRoute roles={['admin', 'doctor', 'secretary']} />}>
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/new" element={<PatientFormPage />} />
            <Route path="/patients/edit/:id" element={<PatientFormPage />} />
          </Route>

          {/* NOVO: Rotas de Gerenciamento de Agendamentos (apenas para admin, doctor, secretary) */}
          <Route element={<PrivateRoute roles={['admin', 'doctor', 'secretary']} />}>
            <Route path="/appointments" element={<AppointmentList />} />
            <Route path="/appointments/new" element={<AppointmentFormPage />} />
            <Route path="/appointments/edit/:id" element={<AppointmentFormPage />} />
          </Route>

          {/* NOVO: Rotas de Planos de Saúde (Admin e Secretário) */}
          <Route element={<PrivateRoute roles={['admin', 'secretary']} />}>
            <Route path="/insurance-plans" element={<InsurancePlanListPage />} />
            <Route path="/insurance-plans/new" element={<InsurancePlanFormPage />} />
            <Route path="/insurance-plans/edit/:id" element={<InsurancePlanFormPage />} />
          </Route>

          {/* Adicione uma rota para 404 Not Found se desejar */}
          <Route path="*" element={<p className="text-center text-xl mt-20">404 - Page Not Found</p>} />

          {/* Adicione outras rotas protegidas aqui conforme necessário */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
