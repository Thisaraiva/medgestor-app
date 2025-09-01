// frontend/src/components/UserForm.js

import React, { useState, useEffect } from 'react';
import authService from '../services/authService'; // Importa o serviço de autenticação

const UserForm = ({ user, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('secretary');
  const [crm, setCrm] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Preenche o formulário se um usuário for passado para edição
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setRole(user.role || 'secretary');
      setCrm(user.crm || '');
      // Não preenche a senha por segurança em modo de edição
      setPassword('');
    } else {
      // Limpa o formulário se não houver usuário para edição
      setName('');
      setEmail('');
      setPassword('');
      setRole('secretary');
      setCrm('');
    }
    setMessage(''); // Limpa mensagens ao mudar de usuário/modo
    setIsError(false);
  }, [user]);

  const isValidCrm = (value) => {
    if (!value) return false;
    return /^CRM\/[A-Z]{2}-\d{1,6}$/.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    // Validações no frontend
    if (!name.trim()) {
      setMessage('O nome é obrigatório.');
      setIsError(true);
      setLoading(false);
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Email inválido.');
      setIsError(true);
      setLoading(false);
      return;
    }

    // A senha é obrigatória apenas para novos registros
    if (!user && password.length < 6) {
      setMessage('A senha deve ter pelo menos 6 caracteres.');
      setIsError(true);
      setLoading(false);
      return;
    }

    if (role === 'doctor' && !isValidCrm(crm)) {
      setMessage('CRM deve estar no formato CRM/UF-XXXXXX (ex: CRM/SP-123456).');
      setIsError(true);
      setLoading(false);
      return;
    }

    if (role !== 'doctor' && crm) {
      setMessage('CRM só é permitido para médicos.');
      setIsError(true);
      setLoading(false);
      return;
    }

    try {
      const userData = {
        name: name.trim(),
        email: email.trim(),
        role: role.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
        crm: role === 'doctor' ? crm : undefined, // Envia CRM apenas para médicos
      };

      // Adiciona a senha apenas se for um novo registro ou se a senha foi alterada
      if (!user || password) {
        userData.password = password;
      }

      if (user) {
        // Atualiza usuário existente
        await authService.updateUser(user.id, userData);
        setMessage('Usuário atualizado com sucesso!');
        onSubmit('Usuário atualizado com sucesso!', false);
      } else {
        // Registra novo usuário
        await authService.register(userData);
        setMessage('Registro realizado com sucesso!');
        onSubmit('Registro realizado com sucesso!', false);
        // Limpa o formulário após o cadastro
        setName('');
        setEmail('');
        setPassword('');
        setRole('secretary');
        setCrm('');
      }
      setIsError(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Erro ao salvar usuário. Tente novamente.';
      setMessage(errorMessage);
      setIsError(true);
      onSubmit(errorMessage, true);
      console.error('Erro ao salvar usuário:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-DEFAULT p-6 rounded-xl shadow-custom-medium">
      <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
        {user ? 'Editar Usuário' : 'Registrar Novo Usuário'}
      </h2>

      {message && (
        <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isError ? 'bg-error text-white' : 'bg-success text-white'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="userName">
            Nome Completo
          </label>
          <input
            type="text"
            id="userName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
            placeholder="Nome do usuário"
            required
            autoComplete="name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="userEmail">
            Email
          </label>
          <input
            type="email"
            id="userEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
            placeholder="email@exemplo.com"
            required
            autoComplete="email"
            disabled={!!user} // Desabilita o email em edição (geralmente não se muda o email de login)
          />
        </div>

        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="userPassword">
            Senha {user ? '(Deixe em branco para manter a atual)' : ''}
          </label>
          <input
            type="password"
            id="userPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
            placeholder={user ? '********' : '********'}
            required={!user} // Senha é obrigatória apenas para novos usuários
            autoComplete={user ? 'new-password' : 'off'}
          />
        </div>

        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="userRole">
            Perfil
          </label>
          <select
            id="userRole"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              if (e.target.value !== 'doctor') setCrm(''); // Limpa CRM se não for médico
            }}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200 bg-white"
            required
          >
            <option value="secretary">Secretária</option>
            <option value="doctor">Médico</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {role === 'doctor' && (
          <div className="mb-4">
            <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="userCrm">
              CRM
            </label>
            <input
              type="text"
              id="userCrm"
              value={crm}
              onChange={(e) => setCrm(e.target.value)}
              className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
              placeholder="CRM/UF-XXXXXX (ex: CRM/SP-123456)"
              required
              autoComplete="off"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-primary-dark text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
          disabled={loading}
        >
          {loading ? 'Salvando...' : (user ? 'Salvar Alterações' : 'Registrar Usuário')}
        </button>
      </form>
    </div>
  );
};

export default UserForm;
