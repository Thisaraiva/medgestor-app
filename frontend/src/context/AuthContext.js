// frontend/src/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService'; // Importa o serviço de autenticação

// Cria o contexto de autenticação.
// Ele fornecerá o estado de autenticação e as funções para login/logout
// para qualquer componente que o consumir.
const AuthContext = createContext(null);

// Componente provedor do contexto de autenticação.
// Ele gerencia o estado de autenticação e o disponibiliza para seus filhos.
export const AuthProvider = ({ children }) => {
  // Estado para armazenar o token de autenticação
  const [token, setToken] = useState(localStorage.getItem('token'));
  // Estado para armazenar as informações do usuário (opcional, mas útil)
  const [user, setUser] = useState(null);
  // Estado para indicar se o carregamento inicial da autenticação foi concluído
  const [loading, setLoading] = useState(true);

  // Efeito para verificar o token no localStorage quando o componente é montado.
  // Isso permite que o usuário permaneça logado se ele fechar e reabrir o navegador.
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Aqui você poderia adicionar uma lógica para decodificar o token
      // ou fazer uma chamada ao backend para obter os dados do usuário.
      // Por enquanto, vamos apenas definir o token.
      // Exemplo: const decodedUser = jwt_decode(storedToken); setUser(decodedUser);
    }
    setLoading(false); // Marca o carregamento inicial como concluído
  }, []);

  // Função para realizar o login do usuário.
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const newToken = response.token;
      localStorage.setItem('token', newToken); // Armazena o token no localStorage
      setToken(newToken); // Atualiza o estado do token
      // Opcional: decodificar o token para obter informações do usuário
      // setUser(jwt_decode(newToken));
      return response; // Retorna a resposta do serviço de autenticação
    } catch (error) {
      console.error('Erro no login:', error);
      throw error; // Propaga o erro para o componente que chamou o login
    }
  };

  // Função para realizar o logout do usuário.
  const logout = () => {
    localStorage.removeItem('token'); // Remove o token do localStorage
    setToken(null); // Limpa o estado do token
    setUser(null); // Limpa o estado do usuário
    // Redirecionar para a página de login pode ser feito no componente que chama o logout
  };

  // O valor que será fornecido para os componentes que consomem este contexto.
  // Inclui o token, o estado de carregamento, as funções de login e logout, e as informações do usuário.
  const authContextValue = {
    token,
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!token, // Propriedade conveniente para verificar se o usuário está autenticado
  };

  // Retorna o provedor do contexto, envolvendo os filhos.
  // Isso garante que todos os componentes dentro do <AuthProvider> tenham acesso ao contexto.
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir o contexto de autenticação.
// Facilita o uso do contexto em componentes funcionais.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Garante que o hook seja usado apenas dentro de um AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
