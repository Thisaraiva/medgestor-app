// frontend/src/pages/PatientList.js

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import patientService from '../services/patientService'; // Importa o serviço de paciente
import PatientForm from '../components/PatientForm'; // Importa o formulário de paciente
import { useAuth } from '../context/AuthContext'; // Para verificar permissões
import Modal from '../components/Modal'; // Importa o componente Modal
import ConfirmDialog from '../components/ConfirmDialog'; // Importa o componente de confirmação

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPatientForm, setShowPatientForm] = useState(false); // Estado para controlar visibilidade do formulário
  const [editingPatient, setEditingPatient] = useState(null); // Para armazenar o paciente sendo editado
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // Estado para o diálogo de confirmação
  const [patientToDelete, setPatientToDelete] = useState(null); // ID do paciente a ser excluído
  const [actionMessage, setActionMessage] = useState(''); // Para mensagens de sucesso/erro (adição, edição, exclusão)
  const [isActionError, setIsActionError] = useState(false); // Para indicar se a mensagem é de erro
  const { user } = useAuth(); // Obtém o usuário logado

  // Função para buscar pacientes do backend
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.getPatients(); // Chama o serviço para buscar pacientes
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
  }, []);

  // Funções para CRUD
  const handleAddPatient = () => {
    setEditingPatient(null); // Limpa qualquer paciente em edição
    setShowPatientForm(true); // Mostra o formulário para adicionar
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient); // Define o paciente para edição
    setShowPatientForm(true); // Mostra o formulário para edição
  };

  const confirmDeletePatient = (patientId) => {
    setPatientToDelete(patientId);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirmed = async () => {
    setShowConfirmDialog(false); // Esconde o diálogo de confirmação
    if (patientToDelete) {
      try {
        await patientService.deletePatient(patientToDelete); // Chama o serviço de exclusão
        setActionMessage('Paciente excluído com sucesso!'); // Mensagem de sucesso
        setIsActionError(false);
        fetchPatients(); // Recarrega a lista após exclusão
      } catch (err) {
        console.error('Erro ao excluir paciente:', err);
        const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Erro ao excluir paciente. Tente novamente.';
        setActionMessage(errorMessage); // Mensagem de erro
        setIsActionError(true);
      } finally {
        setPatientToDelete(null);
        setTimeout(() => setActionMessage(''), 3000); // Limpa a mensagem após 3 segundos
      }
    }
  };

  const handleFormSubmit = (message, isError) => { // Recebe message e isError do PatientForm
    setShowPatientForm(false); // Esconde o formulário após submissão
    setEditingPatient(null);    // Limpa o paciente em edição
    setActionMessage(message);  // Define a mensagem de sucesso/erro do formulário
    setIsActionError(isError);  // Define se a mensagem é de erro
    fetchPatients();            // Recarrega a lista de pacientes
    setTimeout(() => setActionMessage(''), 3000); // Limpa a mensagem após 3 segundos
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

        {/* Modal para Adicionar/Editar Paciente */}
        <Modal show={showPatientForm} onClose={() => setShowPatientForm(false)}>
          <PatientForm patient={editingPatient} onSubmit={handleFormSubmit} />
        </Modal>

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
