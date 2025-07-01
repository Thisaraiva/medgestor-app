// frontend/src/pages/PatientList.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Importa useNavigate e useLocation
import Navbar from '../components/Navbar';
import patientService from '../services/patientService';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog'; // Importa o componente de confirmação

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [isActionError, setIsActionError] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate(); // Hook para navegação
  const location = useLocation(); // Hook para acessar o state da localização

  // Função para buscar pacientes do backend
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.getPatients();
      setPatients(data);
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
      setError('Erro ao carregar pacientes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar pacientes quando o componente é montado
  useEffect(() => {
    fetchPatients();
    // Verifica se há uma mensagem no state da localização (vindo do PatientFormPage)
    if (location.state && location.state.message) {
      setActionMessage(location.state.message);
      setIsActionError(location.state.isError || false);
      // Limpa a mensagem do state para que não apareça novamente ao navegar
      navigate(location.pathname, { replace: true, state: {} });
      setTimeout(() => setActionMessage(''), 3000);
    }
  }, [location.state]); // Adicionado location.state como dependência para reagir a mensagens de navegação


  // Funções para CRUD
  const handleAddPatient = () => {
    navigate('/patients/new'); // Navega para a página de adição de paciente
  };

  const handleEditPatient = (patient) => {
    navigate(`/patients/edit/${patient.id}`); // Navega para a página de edição de paciente
  };

  const confirmDeletePatient = (patientId) => {
    setPatientToDelete(patientId);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirmed = async () => {
    setShowConfirmDialog(false);
    if (patientToDelete) {
      try {
        await patientService.deletePatient(patientToDelete);
        setActionMessage('Paciente excluído com sucesso!');
        setIsActionError(false);
        fetchPatients();
      } catch (err) {
        console.error('Erro ao excluir paciente:', err);
        const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Erro ao excluir paciente. Tente novamente.';
        setActionMessage(errorMessage);
        setIsActionError(true);
      } finally {
        setPatientToDelete(null);
        setTimeout(() => setActionMessage(''), 3000);
      }
    }
  };

  // Verifica se o usuário tem permissão para gerenciar pacientes (Secretária, Médico, Admin)
  const canManagePatients = user && (
    user.role === 'admin' || user.role === 'doctor' || user.role === 'secretary'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light font-sans flex items-center justify-center">
        <p className="text-text-DEFAULT text-lg">Carregando pacientes...</p>
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
          <h1 className="text-4xl font-bold text-primary-dark">Lista de Pacientes</h1>
          {canManagePatients && (
            <button
              onClick={handleAddPatient}
              className="bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-DEFAULT transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            >
              Adicionar Paciente
            </button>
          )}
        </div>

        {/* Mensagem de Ação (Sucesso/Erro) */}
        {actionMessage && (
          <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isActionError ? 'bg-error text-white' : 'bg-success text-white'}`}>
            {actionMessage}
          </div>
        )}

        {/* Removido Modal para Adicionar/Editar Paciente */}
        {/* Removido PatientForm */}

        {/* Diálogo de Confirmação para Exclusão */}
        <ConfirmDialog
          show={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleDeleteConfirmed}
          message="Tem certeza que deseja excluir este paciente?"
        />

        {patients.length === 0 ? (
          <p className="text-center text-text-light text-lg mt-10">Nenhum paciente cadastrado ainda.</p>
        ) : (
          <div className="overflow-x-auto bg-background-DEFAULT rounded-xl shadow-custom-medium">
            <table className="min-w-full divide-y divide-secondary-dark">
              <thead className="bg-secondary-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Alergias
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-dark">
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-DEFAULT">
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {patient.cpf}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {patient.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {patient.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {patient.allergies || 'Nenhuma'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {canManagePatients && (
                        <>
                          <button
                            onClick={() => handleEditPatient(patient)}
                            className="text-primary-DEFAULT hover:text-primary-dark mr-4"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => confirmDeletePatient(patient.id)}
                            className="text-error hover:text-red-700"
                          >
                            Excluir
                          </button>
                        </>
                      )}
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

export default PatientList;
