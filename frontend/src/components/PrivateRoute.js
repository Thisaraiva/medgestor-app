// frontend/src/components/PrivateRoute.js

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importa o hook de autenticação

const PrivateRoute = ({ roles }) => {
  const { isAuthenticated, user } = useAuth(); // Obtém o estado de autenticação e dados do usuário

  // 1. Verifica se o usuário está autenticado
  if (!isAuthenticated) {
    // Se não estiver autenticado, redireciona para a página de login.
    // replace=true impede que o usuário volte para a página protegida usando o botão "voltar" do navegador.
    return <Navigate to="/" replace />;
  }

  // 2. Se roles forem especificados, verifica se o usuário tem um dos papéis permitidos
  if (roles && user && !roles.includes(user.role)) {
    // Se o usuário não tiver a permissão necessária, redireciona para o dashboard (ou uma página de erro 403).
    // Poderíamos criar uma página de "Acesso Negado" aqui.
    return <Navigate to="/dashboard" replace />; // Redireciona para o dashboard se não tiver permissão
  }

  // Se estiver autenticado e tiver a permissão (se roles foram especificados),
  // renderiza os componentes filhos da rota (Outlet).
  return <Outlet />;
};

export default PrivateRoute;
