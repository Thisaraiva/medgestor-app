// frontend/src/pages/CalendarPage.js (APENAS a parte relevante - função handleFormSubmit e props do AppointmentForm)
import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Navbar from '../components/Navbar';
import AppointmentForm from '../components/AppointmentForm';
import ConfirmDialog from '../components/ConfirmDialog';
import appointmentService from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { formatTimeOnly, alignTo30Min, APP_TIMEZONE } from '../utils/dateUtils';
import moment from 'moment-timezone';

const CalendarPage = () => {
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();

  // Carrega lista de médicos
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!currentUser) return;
      try {
        const response = await appointmentService.getAllAppointments({});
        const doctorSet = new Set();
        const doctorList = [];

        (response.data || []).forEach(appt => {
          if (appt.doctor?.id && !doctorSet.has(appt.doctor.id)) {
            doctorSet.add(appt.doctor.id);
            doctorList.push({
              id: appt.doctor.id,
              name: appt.doctor.name
            });
          }
        });

        setDoctors(doctorList);
        
        // Se for médico, seleciona automaticamente
        if (currentUser.role === 'doctor') {
          setSelectedDoctorId(currentUser.id);
        }
      } catch (err) {
        console.error('Erro ao carregar médicos:', err);
        showMessage('Erro ao carregar lista de médicos', true);
      }
    };
    fetchDoctors();
  }, [currentUser]);

  // Carrega eventos do calendário
  const fetchEvents = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    const filters = currentUser.role === 'doctor' 
      ? { doctorId: currentUser.id } 
      : selectedDoctorId 
        ? { doctorId: selectedDoctorId } 
        : {};

    try {
      const response = await appointmentService.getAllAppointments(filters);
      const formattedEvents = (response.data || [])
        .filter(appt => appt.id && appt.isoStart && appt.patient)
        .map(appt => {
          const timeStr = formatTimeOnly(appt.isoStart);
          return {
            id: appt.id,
            title: `${appt.patient.name} (${appt.type === 'initial' ? 'Inicial' : 'Retorno'})`,
            start: appt.isoStart,
            end: appt.isoEnd,
            backgroundColor: appt.insurance ? '#1a73e8' : '#34a853',
            borderColor: 'transparent',
            textColor: '#ffffff',
            extendedProps: {
              ...appt,
              displayTime: timeStr // Adiciona hora formatada para tooltips
            }
          };
        });

      setEvents(formattedEvents);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
      showMessage('Erro ao carregar agenda', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedDoctorId, currentUser]);

  const showMessage = (msg, error = false) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => setMessage(''), 5000);
  };

  // Clique em data vazia - novo agendamento
  const handleDateClick = (info) => {
    const clickedDate = moment.tz(info.date, APP_TIMEZONE);
    const alignedDate = alignTo30Min(clickedDate);

    setSelectedAppointment({
      dateOnly: alignedDate.format('YYYY-MM-DD'),
      timeOnly: alignedDate.format('HH:mm')
    });
    setShowForm(true);
  };

  // Clique em evento existente - editar
  const handleEventClick = (info) => {
    setSelectedAppointment(info.event.extendedProps);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedAppointment(null);
  };

  const handleFormSubmit = (msg, error) => {
    showMessage(msg, error);
    if (!error) {
      handleFormClose();
      fetchEvents();
    }
  };

    // CORREÇÃO: Função para solicitação de exclusão do formulário
  const handleDeleteRequest = (appointmentId) => {
    setAppointmentToDelete(appointmentId);
    setShowConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!appointmentToDelete) return;
    
    setLoading(true);
    try {
      await appointmentService.deleteAppointment(appointmentToDelete);
      showMessage('Agendamento excluído com sucesso!', false);
      fetchEvents();
      setShowForm(false); // Fecha o formulário após exclusão
    } catch (err) {
      console.error('Erro ao excluir agendamento:', err);
      showMessage('Erro ao excluir agendamento', true);
    } finally {
      setLoading(false);
      setShowConfirm(false);
      setAppointmentToDelete(null);
    }
  };

  // Novo agendamento via botão
  const handleNewAppointment = () => {
    const now = moment().tz(APP_TIMEZONE);
    const alignedNow = alignTo30Min(now);

    setSelectedAppointment({
      dateOnly: alignedNow.format('YYYY-MM-DD'),
      timeOnly: alignedNow.format('HH:mm')
    });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background-light">
      <Navbar />
      
      <div className="container mx-auto p-4 lg:p-6">
        {/* Cabeçalho */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary-dark">
            Agenda Médica
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full lg:w-auto">
            {/* Filtro de Médicos (apenas para admin/secretária) */}
            {currentUser?.role !== 'doctor' && doctors.length > 0 && (
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full sm:w-auto p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-dark focus:border-transparent bg-white"
                disabled={loading}
              >
                <option value="">Todos os médicos</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            )}
            
            <button
              onClick={handleNewAppointment}
              disabled={loading}
              className="w-full sm:w-auto bg-primary-dark text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-light disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Novo Agendamento
            </button>
          </div>
        </div>

        {/* Mensagens */}
        {message && (
          <div className={`p-4 mb-6 rounded-lg text-center font-medium ${
            isError 
              ? 'bg-red-700 text-red-100 border border-red-300' 
              : 'bg-green-700 text-green-100 border border-green-300'
          }`}>
            {message}
          </div>
        )}

        {/* Calendário */}
        <div className="bg-white rounded-2xl shadow-xl p-4 lg:p-6 overflow-hidden">
          {loading && (
            <div className="text-center py-4 text-text-light">
              Carregando agendamentos...
            </div>
          )}
          
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            selectable={false}
            slotDuration="00:30:00"
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            height="auto"
            locale="pt-br"
            timeZone="local"
            buttonText={{
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana', 
              day: 'Dia'
            }}
            slotEventOverlap={false}
            dayMaxEvents={3}
            moreLinkClick="popover"
            moreLinkContent={(args) => `+${args.num} mais`}
            
            // CORREÇÃO: Tooltips consistentes
            eventDidMount={(info) => {
              const { extendedProps } = info.event;
              const timeStr = extendedProps.displayTime || formatTimeOnly(info.event.start);
              const title = `${timeStr} - ${info.event.title}`;
              
              info.el.setAttribute('title', title);
              
              // Estilos específicos para view mensal
              if (info.view.type === 'dayGridMonth') {
                info.el.style.backgroundColor = info.event.backgroundColor;
                info.el.style.borderColor = 'transparent';
                info.el.style.color = '#ffffff';
                info.el.style.borderRadius = '4px';
                info.el.style.padding = '2px 4px';
                info.el.style.fontSize = '11px';
                info.el.style.marginBottom = '1px';
              }
            }}

            // CORREÇÃO: Conteúdo do evento sem mostrar horário
            eventContent={(info) => {
              let content = '';
              
              if (info.view.type === 'dayGridMonth') {
                // View mensal: mostra apenas nome do paciente e tipo
                content = info.event.title.replace(/^\d{2}:\d{2} - /, '');
              } else {
                // Views diária/semanal: conteúdo padrão
                content = info.event.title;
              }
              
              return {
                html: `<div class="fc-event-content p-1 text-xs font-medium truncate cursor-pointer">${content}</div>`
              };
            }}

            // CORREÇÃO: Células do mês
            dayCellContent={(info) => (
              <div className={info.isToday ? 'bg-blue-50 rounded p-1 text-center font-semibold' : 'text-center'}>
                {info.dayNumberText.replace('º', '')}
              </div>
            )}
          />
        </div>

        {/* Modal do Formulário - CORREÇÃO: Adiciona onDelete prop */}
        <Modal show={showForm} onClose={handleFormClose}>
          <AppointmentForm
            appointment={selectedAppointment}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
            onDelete={handleDeleteRequest} // NOVA PROP: Callback para exclusão
          />
        </Modal>

        {/* Modal de Confirmação de Exclusão */}
        <ConfirmDialog
          show={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleDeleteConfirmed}
          message="Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita."
        />
      </div>
    </div>
  );
};

export default CalendarPage;