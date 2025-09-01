// frontend/src/pages/AppointmentFormPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AppointmentForm from '../components/AppointmentForm';
import appointmentService from '../services/appointmentService';

const AppointmentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (id) {
        try {
          const fetchedAppointment = await appointmentService.getAppointmentById(id);
          setAppointment(fetchedAppointment.data);
        } catch (err) {
          console.error('Erro ao buscar agendamento para edição:', err);
          setError('Erro ao carregar dados do agendamento para edição.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchAppointment();

    if (location.state && location.state.message) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [id, location.state, navigate]);

  const handleFormSubmit = (message, isError) => {
    console.log('Formulário de agendamento submetido:', message, 'Erro:', isError);
    setTimeout(() => {
      navigate('/appointments', { state: { message, isError } });
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
        <div className="w-full max-w-md">
          <AppointmentForm appointment={appointment} onSubmit={handleFormSubmit} />
        </div>
      </div>
    </div>
  );
};

export default AppointmentFormPage;
