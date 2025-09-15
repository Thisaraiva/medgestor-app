// frontend/src/pages/Dashboard.js

import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background-light font-sans">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold text-primary-dark mb-8 text-center">
          Bem-vindo ao MedGestor, {user ? user.name : 'Usuário'}!
        </h1>

        {/* Conteúdo Dinâmico Baseado no Perfil do Usuário */}
        {user && user.role === 'admin' && (
          <div className="bg-background-DEFAULT p-6 rounded-xl shadow-custom-light mb-6">
            <h2 className="text-2xl font-semibold text-text-DEFAULT mb-4">Painel do Administrador</h2>
            <p className="text-text-light">
              Aqui você pode gerenciar usuários, configurações do sistema e ter uma visão geral completa.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <Link to="/users" className="bg-secondary-dark p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200 block">
                <h3 className="font-bold text-lg text-primary-dark">Gerenciar Usuários</h3>
                <p className="text-sm text-text-light">Adicione, edite ou remova contas de médicos e secretárias.</p>
              </Link>
              <Link to="/appointments" className="bg-secondary-dark p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200 block">
                <h3 className="font-bold text-lg text-primary-dark">Gerenciar Agendamentos</h3>
                <p className="text-sm text-text-light">Crie, edite e visualize agendamentos de consultas.</p>
              </Link>
              <Link to="/patients" className="bg-secondary-dark p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200 block">
                <h3 className="font-bold text-lg text-primary-dark">Gerenciar Pacientes</h3>
                <p className="text-sm text-text-light">Cadastre e atualize informações de pacientes.</p>
              </Link>
              <Link to="/insurance-plans" className="bg-secondary-dark p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200 block">
                <h3 className="font-bold text-lg text-primary-dark">Gerenciar Planos de Saúde</h3>
                <p className="text-sm text-text-light">Cadastre e atualize informações de planos de saúde.</p>
              </Link>
              <div className="bg-secondary-dark p-4 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg text-primary-dark">Configurações do Sistema</h3>
                <p className="text-sm text-text-light">Ajuste parâmetros globais da aplicação.</p>
              </div>
            </div>
          </div>
        )}

        {user && user.role === 'doctor' && (
          <div className="bg-background-DEFAULT p-6 rounded-xl shadow-custom-light mb-6">
            <h2 className="text-2xl font-semibold text-text-DEFAULT mb-4">Painel do Médico</h2>
            <p className="text-text-light">
              Visualize suas próximas consultas, acesse prontuários e emita receitas.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <Link to="/appointments" className="bg-secondary-dark p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200 block">
                <h3 className="font-bold text-lg text-primary-dark">Meus Agendamentos</h3>
                <p className="text-sm text-text-light">Visualize e gerencie suas consultas.</p>
              </Link>
              <Link to="/patients" className="bg-secondary-dark p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200 block">
                <h3 className="font-bold text-lg text-primary-dark">Meus Pacientes</h3>
                <p className="text-sm text-text-light">Acesse o cadastro e prontuários dos seus pacientes.</p>
              </Link>
              <Link to="/patients" className="bg-secondary-dark p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200 block">
                <h3 className="font-bold text-lg text-primary-dark">Emitir Receitas</h3>
                <p className="text-sm text-text-light">Gere e imprima receitas médicas para seus pacientes.</p>
              </Link>
            </div>
          </div>
        )}

        {user && user.role === 'secretary' && (
          <div className="bg-background-DEFAULT p-6 rounded-xl shadow-custom-light mb-6">
            <h2 className="text-2xl font-semibold text-text-DEFAULT mb-4">Painel da Secretária</h2>
            <p className="text-text-light">
              Gerencie agendamentos, pacientes e o fluxo do consultório.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <Link to="/appointments/new" className="bg-secondary-dark p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200 block">
                <h3 className="font-bold text-lg text-primary-dark">Agendar Consultas</h3>
                <p className="text-sm text-text-light">Crie e edite agendamentos.</p>
              </Link>
              <Link to="/patients" className="bg-secondary-dark p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200 block">
                <h3 className="font-bold text-lg text-primary-dark">Gerenciar Pacientes</h3>
                <p className="text-sm text-text-light">Cadastre e atualize informações de pacientes.</p>
              </Link>
              <Link to="/appointments" className="bg-secondary-dark p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200 block">
                <h3 className="font-bold text-lg text-primary-dark">Consultar Agenda</h3>
                <p className="text-sm text-text-light">Visualize a agenda de todos os médicos.</p>
              </Link>
              <Link to="/insurance-plans" className="bg-secondary-dark p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200 block">
                <h3 className="font-bold text-lg text-primary-dark">Gerenciar Planos de Saúde</h3>
                <p className="text-sm text-text-light">Cadastre e atualize informações de planos de saúde.</p>
              </Link>
            </div>
          </div>
        )}

        {!user && (
          <div className="bg-background-DEFAULT p-6 rounded-xl shadow-custom-light text-center">
            <p className="text-text-light">Carregando informações do usuário...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;