// frontend/src/components/Navbar.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth(); // Obtém o usuário logado e seu papel
    const navigate = useNavigate();

    /**
     * Lida com a ação de logout.
     * Chama a função de logout do contexto e redireciona para a página de login.
     */
    const handleLogout = () => {
        logout(); // Chama a função de logout do contexto
        navigate('/'); // Redireciona para a página de login
    };

    // Verifica se o usuário tem permissão para registrar novos usuários
    // Apenas 'admin', 'doctor' e 'secretary' podem registrar.
    const canRegisterUsers = isAuthenticated && user && (
      user.role === 'admin' || user.role === 'doctor' || user.role === 'secretary'
    );

    return (
        <nav className="bg-primary-DEFAULT p-4 shadow-md font-sans">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo/Nome da Aplicação */}
                <Link to="/dashboard" className="text-white text-2xl font-bold tracking-wide">
                    MedGestor
                </Link>

                {/* Links de Navegação */}
                <div>
                    {isAuthenticated ? (
                        // Links visíveis apenas se o usuário estiver autenticado
                        <>
                            {/* Links com cores mais visíveis */}
                            <Link to="/dashboard" className="text-white hover:text-secondary-light px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                                Dashboard
                            </Link>
                            <Link to="/patients" className="text-white hover:text-secondary-light px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                                Pacientes
                            </Link>
                            {/* Link para Gerenciar Usuários, visível apenas para Admin */}
                            {user?.role === 'admin' || user.role === 'doctor' || user.role === 'secretary' && ( // Apenas admin pode gerenciar usuários
                                <Link to="/users" className="text-white hover:text-secondary-light px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                                    Gerenciar Usuários
                                </Link>
                            )}
                            {/* Link para Registrar Usuário, visível para Admin, Médico e Secretária */}
                            {canRegisterUsers && (
                                <Link to="/register" className="text-white hover:text-secondary-light px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                                    Registrar Usuário
                                </Link>
                            )}
                            {/* Botão de Sair/Logout com cores ajustadas */}
                            <button
                                onClick={handleLogout}
                                className="ml-4 bg-white text-primary-DEFAULT px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        // Links visíveis se o usuário NÃO estiver autenticado (apenas Login)
                        <>
                            <Link to="/" className="text-white hover:text-secondary-light px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                                Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
