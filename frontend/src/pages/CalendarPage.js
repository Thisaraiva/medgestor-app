// frontend/src/pages/CalendarPage.js
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
import { parseBrDateToISO } from '../utils/dateUtils';

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
  const { user: currentUser } = useAuth();

  // Carregar médicos
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!currentUser) return;
      try {
        const res = await appointmentService.getAllAppointments({});
        const doctorMap = new Map();
        (res.data || []).forEach(appt => {
          if (appt.doctor?.id && appt.doctor?.name) {
            doctorMap.set(appt.doctor.id, appt.doctor.name);
          }
        });
        const doctorList = Array.from(doctorMap, ([id, name]) => ({ id, name }));
        setDoctors(doctorList);
        if (currentUser.role === 'doctor') {
          setSelectedDoctorId(currentUser.id);
        }
      } catch (err) {
        console.error('Erro ao carregar médicos:', err);
      }
    };
    fetchDoctors();
  }, [currentUser]);

  // Carregar eventos
  const fetchEvents = async () => {
    if (!currentUser) return;

    try {
      const filters = {};
      if (currentUser.role === 'doctor') {
        filters.doctorId = currentUser.id;
      } else if (selectedDoctorId) {
        filters.doctorId = selectedDoctorId;
      }

      const res = await appointmentService.getAllAppointments(filters);
      const appointments = Array.isArray(res.data) ? res.data : [];

      const formattedEvents = appointments
        .filter(appt => appt.date && appt.id)
        .map(appt => {
          const startISO = parseBrDateToISO(appt.date);
          if (!startISO) {
            console.warn('Data inválida ignorada:', appt.date);
            return null;
          }

          const endDate = new Date(new Date(startISO).getTime() + 30 * 60000);
          const endISO = endDate.toISOString();

          return {
            id: appt.id.toString(),
            title: `${appt.patient?.name || 'Paciente'} (${appt.type === 'initial' ? 'Inicial' : 'Retorno'})`,
            start: startISO,
            end: endISO,
            backgroundColor: appt.insurance ? '#1a73e8' : '#34a853',
            borderColor: appt.insurance ? '#0d47a1' : '#1b5e20',
            extendedProps: { ...appt }
          };
        })
        .filter(event => event !== null);

      setEvents(formattedEvents);
    } catch (err) {
      console.error('Erro ao carregar agenda:', err);
      setMessage('Erro ao carregar agenda. Verifique sua conexão.');
      setIsError(true);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedDoctorId, currentUser]);

  // Novo agendamento
  const handleDateClick = (info) => {
    const localDate = new Date(info.date);
    const isoLocal = localDate.toISOString().slice(0, 16); // 2025-11-01T10:30
    setSelectedAppointment({ date: isoLocal });
    setShowForm(true);
  };

  // Editar
  const handleEventClick = (info) => {
    const appt = info.event.extendedProps;
    if (appt.id) {
      setSelectedAppointment(appt);
      setShowForm(true);
    }
  };

  // Excluir
  const confirmDelete = (id) => {
    setAppointmentToDelete(id);
    setShowConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      await appointmentService.deleteAppointment(appointmentToDelete);
      setMessage('Agendamento excluído!');
      setIsError(false);
      fetchEvents();
    } catch (err) {
      setMessage('Erro ao excluir.');
      setIsError(true);
    } finally {
      setShowConfirm(false);
      setAppointmentToDelete(null);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setSelectedAppointment(null);
    fetchEvents();
    setMessage(selectedAppointment?.id ? 'Atualizado!' : 'Criado!');
    setIsError(false);
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="min-h-screen bg-background-light">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-primary-dark">Agenda</h1>
          <div className="flex gap-4 items-center">
            {currentUser?.role !== 'doctor' && doctors.length > 0 && (
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="p-2 border rounded-lg text-sm"
              >
                <option value="">Todos os médicos</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => {
                const now = new Date();
                now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);
                setSelectedAppointment({ date: now.toISOString().slice(0, 16) });
                setShowForm(true);
              }}
              className="bg-primary-dark text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-light"
            >
              Novo Agendamento
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isError ? 'bg-error text-white' : 'bg-success text-white'}`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-custom-medium p-4">
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
            selectable={true}
            slotDuration="00:30:00"
            slotMinTime="07:00:00"
            slotMaxTime="19:00:00"
            height="auto"
            locale="pt-br"
            buttonText={{
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia'
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
            eventContent={(eventInfo) => (
              <div className="p-1 text-xs">
                <strong>{eventInfo.timeText}</strong> {eventInfo.event.title}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(eventInfo.event.id);
                  }}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            )}
          />
        </div>

        <Modal show={showForm} onClose={() => { setShowForm(false); setSelectedAppointment(null); }}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">
              {selectedAppointment?.id ? 'Editar' : 'Novo'} Agendamento
            </h2>
            <AppointmentForm
              appointment={selectedAppointment}
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setSelectedAppointment(null); }}
            />
          </div>
        </Modal>

        <ConfirmDialog
          show={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleDeleteConfirmed}
          message="Excluir este agendamento?"
        />
      </div>
    </div>
  );
};

export default CalendarPage;