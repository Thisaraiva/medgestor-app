// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; // <-- VERIFIQUE ESTA LINHA: IMPORTAÇÃO DO COMPONENTE REGISTER
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import { AuthProvider } from './context/AuthContext';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Rota para a página de Login (raiz da aplicação) */}
                    <Route path="/" element={<Login />} />
                    {/* Rota para a página de Registro */}
                    <Route path="/register" element={<Register />} /> {/* <-- VERIFIQUE ESTA LINHA: USO DO COMPONENTE REGISTER */}
                    {/* Rota para o Dashboard, que exigirá autenticação */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    {/* Rota para a Lista de Pacientes, que exigirá autenticação */}
                    <Route path="/patients" element={<PatientList />} />
                    {/* Adicione outras rotas aqui conforme o desenvolvimento avança */}
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
