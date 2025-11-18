import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoadingSpinner from './components/LoadingSpinner'; // vamos criar

// Lazy load de todas as páginas
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const UserFormPage = lazy(() => import('./pages/UserFormPage'));
const PatientList = lazy(() => import('./pages/PatientList'));
const PatientFormPage = lazy(() => import('./pages/PatientFormPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const AppointmentFormPage = lazy(() => import('./pages/AppointmentFormPage'));
const InsurancePlanListPage = lazy(() => import('./pages/InsurancePlanList'));
const InsurancePlanFormPage = lazy(() => import('./pages/InsurancePlanFormPage'));
const RecordViewPage = lazy(() => import('./pages/RecordViewPage'));
const RecordFormPage = lazy(() => import('./pages/RecordFormPage'));
const PrescriptionListPage = lazy(() => import('./pages/PrescriptionListPage'));
const PrescriptionFormPage = lazy(() => import('./pages/PrescriptionFormPage'));
const PrescriptionPrint = lazy(() => import('./components/PrescriptionPrint'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            <Route element={<PrivateRoute roles={['admin', 'doctor', 'secretary']} />}>
              <Route path="/users" element={<UserManagement />} />
              <Route path="/users/new" element={<UserFormPage />} />
              <Route path="/users/edit/:id" element={<UserFormPage />} />
              <Route path="/register" element={<UserFormPage />} />
            </Route>

            <Route element={<PrivateRoute roles={['admin', 'doctor', 'secretary']} />}>
              <Route path="/patients" element={<PatientList />} />
              <Route path="/patients/new" element={<PatientFormPage />} />
              <Route path="/patients/edit/:id" element={<PatientFormPage />} />
            </Route>

            <Route element={<PrivateRoute roles={['admin', 'doctor', 'secretary']} />}>
              <Route path="/appointments" element={<CalendarPage />} />
              <Route path="/appointments/new" element={<AppointmentFormPage />} />
              <Route path="/appointments/edit/:id" element={<AppointmentFormPage />} />
            </Route>

            <Route element={<PrivateRoute roles={['admin', 'secretary']} />}>
              <Route path="/insurance-plans" element={<InsurancePlanListPage />} />
              <Route path="/insurance-plans/new" element={<InsurancePlanFormPage />} />
              <Route path="/insurance-plans/edit/:id" element={<InsurancePlanFormPage />} />
            </Route>

            <Route element={<PrivateRoute roles={['admin', 'doctor'/*, 'secretary'*/]} />}>
              <Route path="/patients/:patientId/medical-records" element={<RecordViewPage />} />
              <Route path="/patients/:patientId/medical-records/new" element={<RecordFormPage />} />
              <Route path="/patients/:patientId/medical-records/edit/:recordId" element={<RecordFormPage />} />
            </Route>
            
            <Route element={<PrivateRoute roles={['admin', 'doctor', 'secretary']} />}>
              <Route path="/patients/:patientId/prescriptions" element={<PrescriptionListPage />} />
              {/* Secretary pode ver a lista e imprimir */}
            </Route>

            <Route element={<PrivateRoute roles={['admin', 'doctor']} />}>
              <Route path="/patients/:patientId/prescriptions/new" element={<PrescriptionFormPage />} />
              <Route path="/patients/:patientId/prescriptions/edit/:prescriptionId" element={<PrescriptionFormPage />} />
            </Route>

            <Route path="/prescriptions/print/:prescriptionId" element={<PrescriptionPrint />} />
            <Route path="*" element={<p className="text-center text-xl mt-20">404 - Página não encontrada</p>} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;