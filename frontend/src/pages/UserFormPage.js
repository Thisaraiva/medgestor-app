// frontend/src/pages/UserFormPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import UserForm from '../components/UserForm'; // Importa o novo UserForm
import authService from '../services/authService'; // Para buscar usuário para edição

const UserFormPage = () => {
  const { id } = useParams(); // Obtém o ID do usuário da URL (se estiver em modo de edição)
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [isActionError, setIsActionError] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (id) { // Se houver um ID na URL, estamos em modo de edição
        try {
          const response = await authService.getUserById(id); // 'response' é o objeto completo do Axios
          setUser(response.data); // Acessa 'response.data' para obter o objeto do usuário
        } catch (err) {
          console.error('Erro ao buscar usuário para edição:', err);
          setError('Erro ao carregar dados do usuário para edição.');
        } finally {
          setLoading(false);
        }
      } else { // Se não houver ID, estamos em modo de adição
        setLoading(false);
      }
    };
    fetchUser();

    // Lida com mensagens passadas via state de navegação
    if (location.state && location.state.message) {
      setActionMessage(location.state.message);
      setIsActionError(location.state.isError || false);
      navigate(location.pathname, { replace: true, state: {} }); // Limpa a mensagem do state
      setTimeout(() => setActionMessage(''), 3000);
    }
  }, [id, location.state]); // Dependência em id e location.state

  const handleFormSubmit = (message, isError) => {
    // Após a submissão do formulário, exibe a mensagem e redireciona para a lista de usuários
    console.log('Formulário de usuário submetido:', message, 'Erro:', isError);
    setTimeout(() => {
      navigate('/users', { state: { message, isError } }); // Redireciona para UserManagement
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light font-sans flex items-center justify-center">
        <p className="text-text-DEFAULT text-lg">Carregando formulário de usuário...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light font-sans flex items-center justify-center">
        <p className="text-error text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light font-sans">
      <Navbar />
      <div className="container mx-auto p-6 flex justify-center">
        <div className="w-full max-w-md"> {/* Largura ajustada para formulário de usuário */}
          {actionMessage && (
            <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isActionError ? 'bg-error text-white' : 'bg-success text-white'}`}>
              {actionMessage}
            </div>
          )}
          <UserForm user={user} onSubmit={handleFormSubmit} />
        </div>
      </div>
    </div>
  );
};

export default UserFormPage;
