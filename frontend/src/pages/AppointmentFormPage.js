// frontend/src/pages/AppointmentFormPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AppointmentForm from '../components/AppointmentForm';
import appointmentService from '../services/appointmentService';

const AppointmentFormPage = () => {
  const { id } = useParams(); // Obtém o ID do agendamento da URL (se estiver em modo de edição)
  const navigate = useNavigate();
  const location = useLocation();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (id) { // Se houver um ID na URL, estamos em modo de edição
        try {
          const fetchedAppointment = await appointmentService.getAppointmentById(id);
          setAppointment(fetchedAppointment.data); // Axios retorna os dados em .data
        } catch (err) {
          console.error('Erro ao buscar agendamento para edição:', err);
          setError('Erro ao carregar dados do agendamento para edição.');
        } finally {
          setLoading(false);
        }
      } else { // Se não houver ID, estamos em modo de adição
        setLoading(false);
      }
    };
    fetchAppointment();

    // Lida com mensagens passadas via state de navegação (se vier de outra página)
    if (location.state && location.state.message) {
      // Não exibe a mensagem aqui, pois o formulário já lida com a própria mensagem de sucesso/erro
      // A mensagem será passada para a lista após a submissão
      navigate(location.pathname, { replace: true, state: {} }); // Limpa a mensagem do state
    }
  }, [id, location.state, navigate]);

  const handleFormSubmit = (message, isError) => {
    // Após a submissão do formulário, exibe a mensagem e redireciona para a lista de agendamentos
    console.log('Formulário de agendamento submetido:', message, 'Erro:', isError);
    setTimeout(() => {
      navigate('/appointments', { state: { message, isError } }); // Passa a mensagem via state
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light font-sans flex items-center justify-center">
        <p className="text-text-DEFAULT text-lg">Carregando formulário de agendamento...</p>
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
      <div className="container mx-auto p-6 flex justify-center">
        <div className="w-full max-w-md"> {/* Largura ajustada para formulário */}
          <AppointmentForm appointment={appointment} onSubmit={handleFormSubmit} />
        </div>
      </div>
    </div>
  );
};

export default AppointmentFormPage;
