// frontend/src/pages/Register.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Importa Link para navegação
import authService from '../services/authService'; // Importa o serviço de autenticação

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('secretaria'); // Valor padrão para o papel do usuário
  const [message, setMessage] = useState(''); // Para mensagens de sucesso/erro
  const [isError, setIsError] = useState(false); // Para controlar o estilo da mensagem
  const navigate = useNavigate();

  /**
   * Lida com o envio do formulário de registro.
   * @param {Event} e - Evento de envio do formulário.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página
    setMessage(''); // Limpa mensagens anteriores
    setIsError(false); // Reseta o estado de erro

    try {
      // Chama o serviço de registro com os dados do formulário
      await authService.register(name, email, password, role);
      setMessage('Registro realizado com sucesso! Redirecionando para o login...');
      setIsError(false);
      // Redireciona para a página de login após um pequeno atraso
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      // Exibe uma mensagem de erro em caso de falha no registro
      const errorMessage = err.response?.data?.message || 'Erro ao registrar. Tente novamente.';
      setMessage(errorMessage);
      setIsError(true);
      console.error('Erro de registro:', err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light font-sans">
      <div className="bg-background-DEFAULT p-8 rounded-xl shadow-custom-medium w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-primary-dark mb-6">Registrar</h2>

        {/* Exibição de mensagens de sucesso ou erro */}
        {message && (
          <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isError ? 'bg-error text-white' : 'bg-success text-white'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campo Nome */}
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
              placeholder="Seu nome completo"
              required
              autocomplete="name"
            />
          </div>

          {/* Campo Email */}
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
              placeholder="seuemail@exemplo.com"
              required
              autocomplete="email"
            />
          </div>

          {/* Campo Senha */}
          <div className="mb-6">
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
              autocomplete="new-password"
            />
          </div>

          {/* Campo Papel/Perfil */}
          <div className="mb-6">
            <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="role">
              Perfil
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200 bg-white"
              required
            >
              <option value="secretaria">Secretária</option>
              <option value="medico">Médico</option>
              {/* <option value="paciente">Paciente</option> - Você pode habilitar isso se o registro de paciente for direto */}
              {/* <option value="admin">Administrador</option> - Geralmente admins são criados manualmente ou por script */}
            </select>
          </div>

          {/* Botão de Registro */}
          <button
            type="submit"
            className="w-full bg-primary-DEFAULT text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Registrar
          </button>
        </form>

        {/* Link para a página de Login */}
        <p className="text-center text-text-light text-sm mt-6">
          Já tem uma conta?{' '}
          <Link to="/" className="text-primary-DEFAULT hover:underline font-semibold">
            Faça Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
