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
import AppointmentList from './pages/AppointmentList';
import AppointmentFormPage from './pages/AppointmentFormPage';
import InsurancePlanListPage from './pages/InsurancePlanList';
import InsurancePlanFormPage from './pages/InsurancePlanFormPage';
import RecordViewPage from './pages/RecordViewPage';
import RecordFormPage from './pages/RecordFormPage';

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
            <Route path="/register" element={<UserFormPage />} />
          </Route>

          {/* Rotas de Gerenciamento de Pacientes (apenas para admin, doctor, secretary) */}
          <Route element={<PrivateRoute roles={['admin', 'doctor', 'secretary']} />}>
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/new" element={<PatientFormPage />} />
            <Route path="/patients/edit/:id" element={<PatientFormPage />} />
          </Route>

          {/* Rotas de Gerenciamento de Agendamentos (apenas para admin, doctor, secretary) */}
          <Route element={<PrivateRoute roles={['admin', 'doctor', 'secretary']} />}>
            <Route path="/appointments" element={<AppointmentList />} />
            <Route path="/appointments/new" element={<AppointmentFormPage />} />
            <Route path="/appointments/edit/:id" element={<AppointmentFormPage />} />
          </Route>

          {/* Rotas de Planos de Saúde (Admin e Secretário) */}
          <Route element={<PrivateRoute roles={['admin', 'secretary']} />}>
            <Route path="/insurance-plans" element={<InsurancePlanListPage />} />
            <Route path="/insurance-plans/new" element={<InsurancePlanFormPage />} />
            <Route path="/insurance-plans/edit/:id" element={<InsurancePlanFormPage />} />
          </Route>

          {/* Rotas de Prontuários */}
          <Route element={<PrivateRoute roles={['admin', 'doctor', 'secretary']} />}>
            <Route path="/patients/:patientId/medical-records" element={<RecordViewPage />} />
            <Route path="/patients/:patientId/medical-records/new" element={<RecordFormPage />} /> 
            <Route path="/patients/:patientId/medical-records/edit/:recordId" element={<RecordFormPage />} />
          </Route>

          <Route path="*" element={<p className="text-center text-xl mt-20">404 - Page Not Found</p>} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;