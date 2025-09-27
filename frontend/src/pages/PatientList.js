// frontend/src/pages/PatientList.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import patientService from '../services/patientService';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { FaEdit, FaTrash, FaPrescriptionBottleAlt } from 'react-icons/fa';
import moment from 'moment'; // Importado moment para formatação de data

// Função auxiliar para formatar a data de nascimento
const formatDateOfBirth = (dateString) => {
  if (!dateString) return 'N/A';
  // O formato armazenado no backend é YYYY-MM-DD (DATEONLY)
  return moment(dateString).format('DD/MM/YYYY');
};

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [isActionError, setIsActionError] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    fetchPatients();
    if (location.state && location.state.message) {
      setActionMessage(location.state.message);
      setIsActionError(location.state.isError || false);
      navigate(location.pathname, { replace: true, state: {} });
      setTimeout(() => setActionMessage(''), 3000);
    }
  }, [location.state, navigate]);

  const handleAddPatient = () => {
    navigate('/patients/new');
  };

  const handleEditPatient = (patient) => {
    navigate(`/patients/edit/${patient.id}`);
  };

  const handleViewPrescriptions = (patientId) => {
    navigate(`/patients/${patientId}/prescriptions`);
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

  // Funções de permissão (mantidas, estão DRY)
  const canManagePatients = user && (
    user.role === 'admin' || user.role === 'doctor' || user.role === 'secretary'
  );

  const canPrescribe = user && (
    user.role === 'admin' || user.role === 'doctor'
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

        {actionMessage && (
          <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isActionError ? 'bg-error text-white' : 'bg-success text-white'}`}>
            {actionMessage}
          </div>
        )}

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
                  {/* NOVO CABEÇALHO */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Nascimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
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
                    {/* NOVA CÉLULA: Data de Nascimento */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {formatDateOfBirth(patient.dateOfBirth)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {patient.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {patient.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end space-x-2">
                      <Link
                        to={`/patients/${patient.id}/medical-records`}
                        className="text-primary-DEFAULT hover:text-primary-dark"
                        title="Ver Prontuários"
                      >
                        Prontuários
                      </Link>
                      {canPrescribe && (
                        <button
                          onClick={() => handleViewPrescriptions(patient.id)}
                          className="text-primary-DEFAULT hover:text-primary-dark"
                          title="Ver Prescrições"
                        >
                          <FaPrescriptionBottleAlt />
                        </button>
                      )}
                      {canManagePatients && (
                        <>
                          <button
                            onClick={() => handleEditPatient(patient)}
                            className="text-primary-DEFAULT hover:text-primary-dark"
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => confirmDeletePatient(patient.id)}
                            className="text-error hover:text-red-700"
                            title="Excluir"
                          >
                            <FaTrash />
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