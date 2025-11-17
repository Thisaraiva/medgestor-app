// frontend/src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

// Função para verificar o token e determinar o estado inicial de autenticação
const getInitialAuthState = () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const decodedUser = jwtDecode(token);
            // Verifica se o token não expirou
            if (decodedUser.exp * 1000 > Date.now()) {
                return { 
                    isAuthenticated: true, 
                    user: decodedUser,
                    loading: false // Carregamento concluído
                };
            }
            // Se expirou, limpamos
            localStorage.removeItem('token');
        } catch (error) {
            console.error('Erro ao decodificar token JWT na inicialização:', error);
            // Se houver erro, limpamos
            localStorage.removeItem('token');
        }
    }
    // Estado inicial padrão (não autenticado)
    return { isAuthenticated: false, user: null, loading: false };
};

export const AuthProvider = ({ children }) => {
    // Inicializa o estado com a função de verificação
    const initialState = getInitialAuthState();

    const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated);
    const [user, setUser] = useState(initialState.user);
    // Definimos loading como false, pois a verificação inicial já ocorreu acima.
    const [loading, setLoading] = useState(initialState.loading); 

    // REMOVEMOS O useEffect ANTERIOR que causava o erro 'set-state-in-effect'.

    /**
     * Função para realizar o login do usuário.
     * @param {string} email - Email do usuário.
     * @param {string} password - Senha do usuário.
     */
    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            // Acessa .data para obter o objeto JSON retornado pelo backend
            // A estrutura atual do backend é { id, name, email, role, crm, token }
            
            // CORREÇÃO: Removemos '...userData' pois não estava sendo usado, eliminando o warning 'no-unused-vars'.
            const { token } = response.data; 
            localStorage.setItem('token', token); // Armazena o token no localStorage

            // Para consistência, decodificamos o token para popular o estado `user`
            const decodedUser = jwtDecode(token);
            setIsAuthenticated(true);
            setUser(decodedUser); // Define os dados do usuário após o login
            return response; // Retorna a resposta completa se necessário para o chamador
        } catch (error) {
            console.error('Erro no login:', error);
            setIsAuthenticated(false);
            setUser(null);
            throw error; // Re-lança o erro para ser tratado pelo componente de login
        }
    };

    /**
     * Função para realizar o logout do usuário.
     */
    const logout = () => {
        localStorage.removeItem('token'); // Remove o token do localStorage
        setIsAuthenticated(false);
        setUser(null); // Limpa os dados do usuário
    };

    // O spinner de carregamento não é mais estritamente necessário se a inicialização for rápida,
    // mas mantemos a estrutura caso você queira usá-la para outras lógicas.
    if (loading) {
        return (
            <div className="min-h-screen bg-background-light font-sans flex items-center justify-center">
                <p className="text-text-DEFAULT text-lg">Carregando autenticação...</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};