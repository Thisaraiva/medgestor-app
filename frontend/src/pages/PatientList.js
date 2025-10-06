// frontend/src/pages/PatientList.js

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import patientService from '../services/patientService';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { FaEdit, FaTrash, FaPrescriptionBottleAlt, FaSearch } from 'react-icons/fa';
import moment from 'moment';

// Função auxiliar para formatar a data de nascimento
const formatDateOfBirth = (dateString) => {
  if (!dateString) return 'N/A';
  return moment(dateString).format('DD/MM/YYYY');
};

const MESSAGE_DURATION = 5000; // Duração da mensagem (5 segundos)

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [isActionError, setIsActionError] = useState(false);
    
  const [searchTerm, setSearchTerm] = useState(''); 
  const [filterName, setFilterName] = useState(''); 

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Função auxiliar para definir a mensagem de ação e seu status de erro (DRY/Melhor Prática)
  const displayActionMessage = useCallback((message, isError = false) => {
    setActionMessage(message);
    setIsActionError(isError);
  }, []);


  // Função de busca de pacientes, memorizada e reutilizável (DRY)
  const fetchPatients = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.getPatients(filters);
      setPatients(data);
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
      // Aqui, ainda usamos uma mensagem genérica para a busca inicial/erro de carregamento
      setError('Erro ao carregar pacientes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Função que executa a pesquisa (chamada no submit)
  const handleSearch = useCallback((e) => {
    if (e) e.preventDefault();  
      
    setFilterName(searchTerm);  
    fetchPatients({ name: searchTerm });
  }, [fetchPatients, searchTerm]);

  // EFEITO 1: Busca Inicial
  useEffect(() => {
    fetchPatients({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // EFEITO 2: Gerenciamento de Mensagens de NAVEGAÇÃO
  useEffect(() => {
    if (location.state && location.state.message) {
      displayActionMessage(location.state.message, location.state.isError || false);
      // Limpa o estado da navegação para que a mensagem não reapareça (Princípio da Responsabilidade Única - SOLID)
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname, displayActionMessage]);

  // EFEITO 3: Gerenciamento do TIMEOUT da Mensagem
  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => {
        setActionMessage('');
      }, MESSAGE_DURATION);
      // Limpa o timer se a mensagem for definida novamente antes do tempo
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);


  // Handler para a mudança do input
  const handleFilterChange = (e) => {
    setSearchTerm(e.target.value);
  };
    
  // Handler para limpar o filtro
  const handleClearFilter = () => {
    setSearchTerm('');
    setFilterName('');
    fetchPatients({}); // Busca todos os pacientes novamente
  };

  // Funções de Navegação Curta (Convenience methods)
  const handleAddPatient = () => navigate('/patients/new');
  const handleEditPatient = (patient) => navigate(`/patients/edit/${patient.id}`);
  const handleViewPrescriptions = (patientId) => navigate(`/patients/${patientId}/prescriptions`);

  const confirmDeletePatient = (patientId) => {
    setPatientToDelete(patientId);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirmed = async () => {
    setShowConfirmDialog(false);
    if (patientToDelete) {
      try {
        await patientService.deletePatient(patientToDelete);
        displayActionMessage('Paciente excluído com sucesso!', false);
        // Recarrega a lista usando o filtro ATIVO (filterName)
        fetchPatients({ name: filterName });
      } catch (err) {
        console.error('Erro ao excluir paciente:', err);
        // Acessa err.response.data.error, que deve conter a mensagem amigável do backend (Tratamento de Erros Consistente)
        const errorMessage = err.response?.data?.error || 'Erro ao excluir paciente. Tente novamente.';
        displayActionMessage(errorMessage, true);
      } finally {
        setPatientToDelete(null);
      }
    }
  };

  // Funções de permissão (DRY/Melhor Prática)
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
      <div className="min-h-screen bg-background-light font-sans flex flex-col items-center justify-center">
        <p className="text-error text-lg mb-4">{error}</p>
        <button
          onClick={() => fetchPatients({ name: filterName })}
          className="bg-primary-DEFAULT text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition duration-300"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light font-sans">
      <Navbar />
      <div className="container mx-auto p-6">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
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

        {/* Formulário de Filtro */}
        <form onSubmit={handleSearch} className="mb-6">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="searchTerm">
            Filtrar por Nome do Paciente
          </label>
          <div className="flex space-x-3">
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={handleFilterChange}
              className="flex-grow p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT transition duration-200"
              placeholder="Digite o nome e clique em Pesquisar..."
              autoComplete="off"
            />
            <button
              type="submit"
              className="bg-primary-dark text-white px-4 py-3 rounded-lg font-semibold hover:bg-primary-DEFAULT transition duration-300 ease-in-out transform hover:scale-105 shadow-md flex items-center space-x-2"
              title="Pesquisar Pacientes"
            >
              <FaSearch />
              <span>Pesquisar</span>
            </button>
            {(filterName || searchTerm) && (
              <button
                type="button"
                onClick={handleClearFilter}
                className="bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-500 transition duration-300 shadow-md"
                title="Limpar Pesquisa"
              >
                Limpar
              </button>
            )}
          </div>
        </form>

        {/* Mensagens de Ação (Sucesso/Erro) */}
        {actionMessage && (
           <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isActionError ? 'bg-error text-white' : 'bg-success text-white'}`}>
            {actionMessage}
          </div>
        )}

        {/* Diálogo de Confirmação de Deleção */}
        <ConfirmDialog
          show={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleDeleteConfirmed}
          message="Tem certeza que deseja excluir este paciente?"
        />

        {/* Mensagem de lista vazia usa o filterName ATIVO para a mensagem */}
        {patients.length === 0 && !loading && (
          <p className="text-center text-text-light text-lg mt-10">
            {filterName ? `Nenhum paciente encontrado com o nome "${filterName}".` : 'Nenhum paciente cadastrado ainda.'}
          </p>
        )}

        {/* Tabela de Pacientes */}
        {patients.length > 0 && (
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
                    Nascimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-dark">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-background-light transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-DEFAULT">
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {patient.cpf}
                    </td>
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
                        className="text-primary-DEFAULT hover:text-primary-dark p-1 rounded transition duration-150"
                        title="Ver Prontuários"
                      >
                        Prontuários
                      </Link>
                      {canPrescribe && (
                        <button
                          onClick={() => handleViewPrescriptions(patient.id)}
                          className="text-primary-DEFAULT hover:text-primary-dark p-1 rounded transition duration-150"
                          title="Ver Prescrições"
                        >
                          <FaPrescriptionBottleAlt className="text-lg" />
                        </button>
                      )}
                      {canManagePatients && (
                        <>
                          <button
                            onClick={() => handleEditPatient(patient)}
                            className="text-primary-DEFAULT hover:text-primary-dark p-1 rounded transition duration-150"
                            title="Editar"
                          >
                            <FaEdit className="text-lg" />
                          </button>
                          <button
                            onClick={() => confirmDeletePatient(patient.id)}
                            className="text-error hover:text-red-700 p-1 rounded transition duration-150"
                            title="Excluir"
                          >
                            <FaTrash className="text-lg" />
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