// frontend/src/pages/UserManagement.js

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import authService from '../services/authService'; // Usaremos o authService para buscar usuários
import { useAuth } from '../context/AuthContext'; // Para verificar permissões
import { Link } from 'react-router-dom'; // <-- Adicionado: Importa o componente Link

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth(); // Pega o usuário logado para verificar permissões

  // Função para buscar todos os usuários
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.getAllUsers(); // Chama o serviço real para buscar usuários do backend
      setUsers(data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError(err.response?.data?.message || 'Erro ao carregar usuários. Verifique suas permissões ou tente novamente.');
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
  }, [currentUser]); // Dependência em currentUser para re-executar se o usuário mudar

  // Funções de CRUD (implementação detalhada virá com o backend)
  const handleEditUser = (userId) => {
    // alert(`Editar usuário com ID: ${userId}`); // Substituir por modal/navegação
    // Implementar modal ou redirecionamento para UserForm
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) { // Substituir por modal personalizado
      try {
        await authService.deleteUser(userId); // Chama o serviço para excluir
        alert('Usuário excluído com sucesso!'); // Usar um modal de sucesso posteriormente
        fetchUsers(); // Recarrega a lista após exclusão
      } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        alert(err.response?.data?.message || 'Erro ao excluir usuário. Verifique suas permissões.'); // Usar um modal de erro
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
            <Link
              to="/register" // Redireciona para a página de registro de usuários
              className="bg-primary-DEFAULT text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            >
              Adicionar Novo Usuário
            </Link>
          )}
        </div>

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
                        onClick={() => handleDeleteUser(u.id)}
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
    </div>
  );
};

export default UserManagement;
