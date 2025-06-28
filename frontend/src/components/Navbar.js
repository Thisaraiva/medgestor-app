// frontend/src/components/Navbar.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importa o hook useAuth

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth(); // Obtém o estado de autenticação e a função de logout
    const navigate = useNavigate();

    /**
     * Lida com a ação de logout.
     * Chama a função de logout do contexto e redireciona para a página de login.
     */
    const handleLogout = () => {
        logout(); // Chama a função de logout do contexto
        navigate('/'); // Redireciona para a página de login
    };

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
                            <Link to="/dashboard" className="text-white hover:text-secondary-dark px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                                Dashboard
                            </Link>
                            <Link to="/patients" className="text-white hover:text-secondary-dark px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                                Pacientes
                            </Link>
                            {/* Botão de Sair/Logout */}
                            <button
                                onClick={handleLogout}
                                className="ml-4 bg-white text-primary-DEFAULT px-4 py-2 rounded-lg font-semibold hover:bg-secondary-dark hover:text-primary-dark transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        // Links visíveis se o usuário NÃO estiver autenticado
                        <>
                            <Link to="/" className="text-white hover:text-secondary-dark px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                                Login
                            </Link>
                            <Link to="/register" className="ml-4 bg-white text-primary-DEFAULT px-4 py-2 rounded-lg font-semibold hover:bg-secondary-dark hover:text-primary-dark transition duration-300 ease-in-out transform hover:scale-105">
                                Registrar
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
