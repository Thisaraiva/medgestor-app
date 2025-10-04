// frontend/src/pages/AppointmentList.js

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import appointmentService from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import moment from 'moment';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [isActionError, setIsActionError] = useState(false);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      let filters = {};
      if (currentUser?.role === 'doctor') {
        filters.doctorId = currentUser.id;
      }
      const response = await appointmentService.getAllAppointments(filters);
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
      setError(err.response?.data?.error?.message || 'Erro ao carregar agendamentos. Verifique suas permissões ou tente novamente.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role && ['admin', 'doctor', 'secretary'].includes(currentUser.role)) {
      fetchAppointments();
    } else {
      setError('Você não tem permissão para acessar esta página.');
      setLoading(false);
    }

    if (location.state && location.state.message) {
      setActionMessage(location.state.message);
      setIsActionError(location.state.isError || false);
      navigate(location.pathname, { replace: true, state: {} });
      setTimeout(() => setActionMessage(''), 5000);
    }
  }, [currentUser, location.state, navigate]);

  const handleAddAppointment = () => {
    navigate('/appointments/new');
  };

  const handleEditAppointment = (appointmentId) => {
    navigate(`/appointments/edit/${appointmentId}`);
  };

  const confirmDeleteAppointment = (appointmentId) => {
    setAppointmentToDelete(appointmentId);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirmed = async () => {
    setShowConfirmDialog(false);
    if (appointmentToDelete) {
      try {
        await appointmentService.deleteAppointment(appointmentToDelete);
        setActionMessage('Agendamento excluído com sucesso!');
        setIsActionError(false);
        fetchAppointments();
      } catch (err) {
        console.error('Erro ao excluir agendamento:', err);
        const errorMessage = err.response?.data?.error?.message || 'Erro ao excluir agendamento. Verifique suas permissões.';
        setActionMessage(errorMessage);
        setIsActionError(true);
      } finally {
        setAppointmentToDelete(null);
        setTimeout(() => setActionMessage(''), 3000);
      }
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return dateString;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light font-sans flex items-center justify-center">
        <p className="text-text-DEFAULT text-lg">Carregando agendamentos...</p>
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
          <h1 className="text-4xl font-bold text-primary-dark">Gerenciamento de Agendamentos</h1>
          {currentUser?.role && ['admin', 'doctor', 'secretary'].includes(currentUser.role) && (
            <button
              onClick={handleAddAppointment}
              className="bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-DEFAULT transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            >
              Novo Agendamento
            </button>
          )}
        </div>

        {actionMessage && (
          <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isActionError ? 'bg-error text-white' : 'bg-success text-white'}`}>
            {actionMessage}
          </div>
        )}

        {appointments.length === 0 ? (
          <p className="text-center text-text-light text-lg mt-10">Nenhum agendamento cadastrado ainda.</p>
        ) : (
          <div className="overflow-x-auto bg-background-DEFAULT rounded-xl shadow-custom-medium">
            <table className="min-w-full divide-y divide-secondary-dark">
              <thead className="bg-secondary-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Médico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Data e Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Convênio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-dark">
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-DEFAULT">
                      {appt.doctor ? appt.doctor.name : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {appt.patient ? appt.patient.name : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {formatDateTime(appt.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light capitalize">
                      {appt.type === 'initial' ? 'Inicial' : 'Retorno'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {appt.insurance ? 'Sim' : 'Não'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {appt.insurance && appt.insurancePlan ? appt.insurancePlan.name : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditAppointment(appt.id)}
                        className="text-primary-DEFAULT hover:text-primary-dark mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => confirmDeleteAppointment(appt.id)}
                        className="text-error hover:text-red-700"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmDialog
        show={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteConfirmed}
        message="Tem certeza que deseja excluir este agendamento?"
      />
    </div>
  );
};

export default AppointmentList;