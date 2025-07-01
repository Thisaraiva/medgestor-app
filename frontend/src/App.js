// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import UserManagement from './pages/UserManagement';
import PatientFormPage from './pages/PatientFormPage';
import UserFormPage from './pages/UserFormPage'; // Importa a nova página de formulário de usuário
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Rota pública para Login */}
                    <Route path="/" element={<Login />} />

                    {/* Rotas Protegidas que exigem apenas autenticação */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/patients" element={<PatientList />} />
                        {/* Rotas para formulário de paciente */}
                        <Route path="/patients/new" element={<PatientFormPage />} />
                        <Route path="/patients/edit/:id" element={<PatientFormPage />} />
                    </Route>

                    {/* Rotas de Gerenciamento de Usuários: Protegidas por papéis específicos */}
                    <Route element={<PrivateRoute roles={['admin', 'doctor', 'secretary']} />}>
                        <Route path="/users" element={<UserManagement />} />
                        {/* Nova rota para adicionar usuário */}
                        <Route path="/users/new" element={<UserFormPage />} />
                        {/* Nova rota para editar usuário por ID */}
                        <Route path="/users/edit/:id" element={<UserFormPage />} />
                        {/* Redireciona /register para /users/new para manter a compatibilidade */}
                        <Route path="/register" element={<UserFormPage />} />
                    </Route>

                    {/* Adicione outras rotas aqui conforme o desenvolvimento avança */}
                    {/* Exemplo de rota protegida para Médicos/Admin: */}
                    {/* <Route element={<PrivateRoute roles={['admin', 'doctor']} />}>
                        <Route path="/medical-records" element={<MedicalRecords />} />
                    </Route> */}
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
