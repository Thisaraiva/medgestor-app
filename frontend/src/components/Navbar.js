// frontend/src/components/Navbar.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth(); // Obtém o usuário logado e seu papel
    const navigate = useNavigate();

   
    const handleLogout = () => {
        logout(); // Chama a função de logout do contexto
        navigate('/'); // Redireciona para a página de login
    };

    
    const canManageUsers = isAuthenticated && user && (
      user.role === 'admin' || user.role === 'secretary'
    );

    
    const canAccessPatients = isAuthenticated && user && (
      user.role === 'admin' || user.role === 'doctor' || user.role === 'secretary'
    );

    
    const canAccessAppointments = isAuthenticated && user && (
      user.role === 'admin' || user.role === 'doctor' || user.role === 'secretary'
    );

    
    const canManageInsurancePlans = isAuthenticated && user && (
        user.role === 'admin' || user.role === 'secretary'
    );

    return (
        <nav className="bg-primary-dark p-4 shadow-md font-sans">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo/Nome da Aplicação */}
                <Link to="/dashboard" className="text-white text-2xl font-bold tracking-wide">
                    MedGestor
                </Link>

                {/* Links de Navegação */}
                <div className="flex items-center space-x-4"> {/* Adicionado flex e space-x para espaçamento */}
                    {isAuthenticated ? (
                        // Links visíveis apenas se o usuário estiver autenticado
                        <>
                            <Link to="/dashboard" className="text-white hover:text-secondary-light px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                                Dashboard
                            </Link>
                            {/*canAccessPatients && ( // Link para Pacientes
                                <Link to="/patients" className="text-white hover:text-secondary-light px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                                    Pacientes
                                </Link>
                            )*/}
                            {canAccessAppointments && ( // Link para Agendamentos
                                <Link to="/appointments" className="text-white hover:text-secondary-light px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                                    Agendamentos
                                </Link>
                            )}
                            {/*canManageUsers && ( // Link para Gerenciar Usuários
                                <Link to="/users" className="text-white hover:text-secondary-light px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                                    Gerenciar Usuários
                                </Link>
                            )}
                            {canManageInsurancePlans && ( // Link para Planos de Saúde
                                <Link to="/insurance-plans" className="text-white hover:text-secondary-light px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                                    Planos de Saúde
                                </Link>
                            )*/}
                            {/* A opção de "Registrar Usuário" foi removida daqui, pois o gerenciamento é feito em /users */}
                            
                            {/* Exibe o nome e papel do usuário logado */}
                            {user && (
                                <span className="text-white text-sm ml-4">
                                    Olá, {user.name} ({user.role})
                                </span>
                            )}

                            {/* Botão de Sair/Logout */}
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
