// frontend/src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Armazena os dados do usuário (incluindo o papel)
  const [loading, setLoading] = useState(true); // Estado de carregamento inicial

  // Efeito para verificar o token no localStorage ao carregar a aplicação
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token); // Decodifica o token para obter os dados do usuário
        // Verifica se o token não expirou
        if (decodedUser.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUser(decodedUser); // Define os dados do usuário
        } else {
          // Token expirado, limpa o localStorage
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao decodificar token JWT:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      }
    }
    setLoading(false); // Finaliza o carregamento inicial
  }, []);

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
      const { token, ...userData } = response.data; // <-- CORREÇÃO AQUI: desestrutura token e o restante em userData
      localStorage.setItem('token', token); // Armazena o token no localStorage

      // Para consistência, decodificamos o token para popular o estado `user`
      // isso garante que `user` sempre tenha as propriedades do payload do JWT.
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

  // Se ainda estiver carregando, pode renderizar um spinner ou nada
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
