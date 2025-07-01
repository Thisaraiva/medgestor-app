// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/UserFormPage';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import UserManagement from './pages/UserManagement'; // Importa o novo componente
import PatientFormPage from './pages/PatientFormPage';
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
                        {/* Nova rota para adicionar paciente */}
                        <Route path="/patients/new" element={<PatientFormPage />} />
                        {/* Nova rota para editar paciente por ID */}
                        <Route path="/patients/edit/:id" element={<PatientFormPage />} />                    
                    </Route>

                    {/* Rota de Registro de Usuário: Protegida por papéis específicos */}
                    {/* Apenas 'admin', 'doctor' e 'secretary' podem acessar a página de registro de novos usuários. */}
                    <Route element={<PrivateRoute roles={['admin', 'doctor', 'secretary']} />}>
                        <Route path="/register" element={<Register />} />
                    </Route>

                    {/* Rota de Gerenciamento de Usuários: Protegida apenas para Admin */}
                    <Route element={<PrivateRoute roles={['admin', 'doctor', 'secretary']} />}>
                        <Route path="/users" element={<UserManagement />} />
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
