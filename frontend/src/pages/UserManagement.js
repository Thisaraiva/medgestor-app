// frontend/src/pages/UserManagement.js

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import authService from '../services/authService'; // Usaremos o authService para buscar usuários
import { useAuth } from '../context/AuthContext'; // Para verificar permissões
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Importa Link, useNavigate e useLocation
import ConfirmDialog from '../components/ConfirmDialog'; // Importa o componente de confirmação

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // Estado para o diálogo de confirmação
  const [userToDelete, setUserToDelete] = useState(null); // ID do usuário a ser excluído
  const [actionMessage, setActionMessage] = useState(''); // Para mensagens de sucesso/erro (adição, edição, exclusão)
  const [isActionError, setIsActionError] = useState(false); // Para indicar se a mensagem é de erro
  const { user: currentUser } = useAuth(); // Pega o usuário logado para verificar permissões
  const navigate = useNavigate();
  const location = useLocation();

  // Função para buscar todos os usuários
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.getAllUsers(); // 'response' é o objeto completo do Axios
      // Acessa 'response.data' para obter o array de usuários
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError(err.response?.data?.message || 'Erro ao carregar usuários. Verifique suas permissões ou tente novamente.');
      setUsers([]); // Garante que users seja um array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apenas 'admin', 'doctor' e 'secretary' podem acessar esta página
    if (currentUser?.role && ['admin', 'doctor', 'secretary'].includes(currentUser.role)) {
      fetchUsers();
    } else {
      setError('Você não tem permissão para acessar esta página.');
      setLoading(false);
    }

    // Lida com mensagens passadas via state de navegação
    if (location.state && location.state.message) {
      setActionMessage(location.state.message);
      setIsActionError(location.state.isError || false);
      navigate(location.pathname, { replace: true, state: {} }); // Limpa a mensagem do state
      setTimeout(() => setActionMessage(''), 3000);
    }
  }, [currentUser, location.state]); // Dependência em currentUser e location.state para re-executar se o usuário/rota mudar

  // Funções de CRUD
  const handleAddUser = () => {
    navigate('/users/new'); // Navega para a página de adição de usuário
  };

  const handleEditUser = (userId) => {
    navigate(`/users/edit/${userId}`); // Navega para a página de edição de usuário
  };

  const confirmDeleteUser = (userId) => {
    setUserToDelete(userId);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirmed = async () => {
    setShowConfirmDialog(false); // Esconde o diálogo de confirmação
    if (userToDelete) {
      try {
        await authService.deleteUser(userToDelete); // Chama o serviço para excluir
        setActionMessage('Usuário excluído com sucesso!'); // Mensagem de sucesso
        setIsActionError(false);
        fetchUsers(); // Recarrega a lista após exclusão
      } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        const errorMessage = err.response?.data?.message || 'Erro ao excluir usuário. Verifique suas permissões.';
        setActionMessage(errorMessage); // Mensagem de erro
        setIsActionError(true);
      } finally {
        setUserToDelete(null);
        setTimeout(() => setActionMessage(''), 3000); // Limpa a mensagem após 3 segundos
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light font-sans flex items-center justify-center">
        <p className="text-text-DEFAULT text-lg">Carregando usuários...</p>
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
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary-dark">Gerenciamento de Usuários</h1>
          {/* O botão "Adicionar Novo Usuário" é visível para admin, doctor e secretary */}
          {currentUser?.role && ['admin', 'doctor', 'secretary'].includes(currentUser.role) && (
            <button
              onClick={handleAddUser} // Usa a nova função para navegar
              className="bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-DEFAULT transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            >
              Adicionar Novo Usuário
            </button>
          )}
        </div>

        {/* Mensagem de Ação (Sucesso/Erro) */}
        {actionMessage && (
          <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isActionError ? 'bg-error text-white' : 'bg-success text-white'}`}>
            {actionMessage}
          </div>
        )}

        {users.length === 0 ? (
          <p className="text-center text-text-light text-lg mt-10">Nenhum usuário cadastrado ainda.</p>
        ) : (
          <div className="overflow-x-auto bg-background-DEFAULT rounded-xl shadow-custom-medium">
            <table className="min-w-full divide-y divide-secondary-dark">
              <thead className="bg-secondary-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Perfil
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-dark">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-DEFAULT">
                      {u.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light capitalize">
                      {u.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(u.id)}
                        className="text-primary-DEFAULT hover:text-primary-dark mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => confirmDeleteUser(u.id)} // Usa o novo modal de confirmação
                        className="text-error hover:text-red-700"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Diálogo de Confirmação para Exclusão de Usuário */}
      <ConfirmDialog
        show={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteConfirmed}
        message="Tem certeza que deseja excluir este usuário?"
      />
    </div>
  );
};

export default UserManagement;
