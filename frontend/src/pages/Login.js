// frontend/src/pages/Login.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Melhor tratamento de erro para exibir mensagens mais úteis
      const errorMessage = err.response?.data?.message || 'Credenciais inválidas. Verifique seu email e senha.';
      setMessage(errorMessage);
      setIsError(true);
      console.error('Erro de login:', err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light font-sans">
      <div className="bg-background-DEFAULT p-8 rounded-xl shadow-custom-medium w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-primary-dark mb-6">Login</h2>

        {message && (
          <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isError ? 'bg-error text-white' : 'bg-success text-white'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              autoComplete="email"
            />
          </div>

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
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-DEFAULT text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-text-light text-sm mt-6">
          Não tem uma conta?{' '}
          {/* O link de registro público foi removido daqui, pois agora é protegido */}
          <span className="text-primary-DEFAULT font-semibold">
            Peça a um administrador para registrar você.
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
