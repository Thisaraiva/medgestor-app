
// frontend/src/pages/Register.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('secretary');
  const [crm, setCrm] = useState(''); // Novo campo para CRM
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  /**
   * Valida o formato do CRM no frontend
   * @param {string} value - O valor do CRM.
   * @returns {boolean} - True se válido, false se inválido.
   */
  const isValidCrm = (value) => {
    if (!value) return false;
    return /^CRM\/[A-Z]{2}-\d{1,6}$/.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    // Validações no frontend
    if (!name.trim()) {
      setMessage('O nome é obrigatório.');
      setIsError(true);
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Email inválido.');
      setIsError(true);
      return;
    }

    if (password.length < 6) {
      setMessage('A senha deve ter pelo menos 6 caracteres.');
      setIsError(true);
      return;
    }

    if (role === 'doctor' && !isValidCrm(crm)) {
      setMessage('CRM deve estar no formato CRM/UF-XXXXXX (ex: CRM/SP-123456).');
      setIsError(true);
      return;
    }

    if (role !== 'doctor' && crm) {
      setMessage('CRM só é permitido para médicos.');
      setIsError(true);
      return;
    }

    try {
      const userData = {
        name: name.trim(),
        email: email.trim(),
        password,
        role: role.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
        crm: role === 'doctor' ? crm : undefined, // Envia CRM apenas para médicos
      };

      await authService.register(userData);
      setMessage('Registro realizado com sucesso! Redirecionando para o dashboard...');
      setIsError(false);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Erro ao registrar. Tente novamente.';
      setMessage(errorMessage);
      setIsError(true);
      console.error('Erro de registro:', err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light font-sans">
      <div className="bg-background-DEFAULT p-8 rounded-xl shadow-custom-medium w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-primary-dark mb-6">Registrar Novo Usuário</h2>

        {message && (
          <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isError ? 'bg-error text-white' : 'bg-success text-white'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="name">
              Nome
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
              placeholder="Nome do novo usuário"
              required
              autoComplete="name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
              placeholder="email@exemplo.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-4">
            <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="password">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
              placeholder="********"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="mb-4">
            <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="role">
              Perfil
            </label>
            <select
              id="role"
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
              <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="crm">
                CRM
              </label>
              <input
                type="text"
                id="crm"
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
            className="w-full bg-primary-dark text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Registrar Usuário
          </button>
        </form>

        <p className="text-center text-text-light text-sm mt-6">
          <Link to="/dashboard" className="text-primary-DEFAULT hover:underline font-semibold">
            Dashboard
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;