// frontend/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaUserMd, FaCalendarAlt, FaUsers, /*FaFileMedical,*/ FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary-dark text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold">MedGestor</Link>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 hover:text-secondary-light">
            <FaHome /> Dashboard
          </Link>
          {user?.role && ['admin', 'doctor', 'secretary'].includes(user.role) && (
            <>
              <Link to="/appointments" className="flex items-center gap-2 hover:text-secondary-light">
                <FaCalendarAlt /> Agendamentos
              </Link>
              <Link to="/patients" className="flex items-center gap-2 hover:text-secondary-light">
                <FaUsers /> Pacientes
              </Link>
              {user.role === 'admin' && (
                <Link to="/users" className="flex items-center gap-2 hover:text-secondary-light">
                  <FaUserMd /> Usuários
                </Link>
              )}
            </>
          )}
          <div className="flex items-center gap-2">
            <FaUserCircle />
            <span>Olá, {user?.name} ({user?.role})</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-error hover:bg-red-700 px-4 py-2 rounded-lg transition"
          >
            <FaSignOutAlt /> Sair
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;