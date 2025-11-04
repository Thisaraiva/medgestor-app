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
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!currentUser) return;
      try {
        const res = await appointmentService.getAllAppointments({});
        const doctorMap = new Map();
        res.data?.forEach(appt => {
          if (appt.doctor?.id) doctorMap.set(appt.doctor.id, appt.doctor.name);
        });
        const list = Array.from(doctorMap, ([id, name]) => ({ id, name }));
        setDoctors(list);
        if (currentUser.role === 'doctor') setSelectedDoctorId(currentUser.id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDoctors();
  }, [currentUser]);

  const fetchEvents = async () => {
    if (!currentUser) return;
    const filters = currentUser.role === 'doctor' ? { doctorId: currentUser.id } : { doctorId: selectedDoctorId };
    try {
      const res = await appointmentService.getAllAppointments(filters);
      const formatted = (res.data || [])
        .filter(a => a.date && a.id)
        .map(appt => {
          const start = parseBrDateToISO(appt.date);
          if (!start) return null;
          const end = new Date(new Date(start).getTime() + 30 * 60000).toISOString();
          const timeStr = moment.utc(appt.date).tz('America/Sao_Paulo').format('HH:mm');
          return {
            id: appt.id,
            title: `${timeStr} - ${appt.patient?.name || 'Paciente'} (${appt.type === 'initial' ? 'Ini' : 'Ret'})`,
            start,
            end,
            backgroundColor: appt.insurance ? '#1a73e8' : '#34a853',
            borderColor: 'transparent',
            textColor: '#fff',
            extendedProps: appt,
          };
        })
        .filter(Boolean);
      setEvents(formatted);
    } catch (err) {
      showMessage('Erro ao carregar agenda.', true);
    }
  };

  useEffect(() => { fetchEvents(); }, [selectedDoctorId, currentUser]);

  const showMessage = (msg, error = false) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleDateClick = (info) => {
    // Usa moment com fuso de SP para evitar +3h
    const local = moment.tz(info.dateStr, 'America/Sao_Paulo');
    const aligned = local.clone().minutes(Math.floor(local.minutes() / 30) * 30).seconds(0);

    setSelectedAppointment({
      dateOnly: aligned.format('YYYY-MM-DD'),
      timeOnly: aligned.format('HH:mm')
    });
    setShowForm(true);
  };

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
    handleFormClose();
    fetchEvents();
  };

  const confirmDelete = (id) => {
    setAppointmentToDelete(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      await appointmentService.deleteAppointment(appointmentToDelete);
      showMessage('Agendamento excluído com sucesso!');
      fetchEvents();
    } catch (err) {
      showMessage('Erro ao excluir agendamento.', true);
    } finally {
      setShowConfirm(false);
      setAppointmentToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background-light">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-4xl font-bold text-primary-dark">Agenda</h1>
          <div className="flex gap-3 items-center flex-wrap">
            {currentUser?.role !== 'doctor' && doctors.length > 0 && (
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="p-3 pr-10 border rounded-lg text-sm focus:ring-2 focus:ring-primary-dark appearance-none bg-white"
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em'
                }}
              >
                <option value="">Todos os médicos</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            )}
            <button
              onClick={() => {
                const now = moment.tz('America/Sao_Paulo');
                now.minutes(Math.floor(now.minutes() / 30) * 30).seconds(0);
                setSelectedAppointment({
                  dateOnly: now.format('YYYY-MM-DD'),
                  timeOnly: now.format('HH:mm')
                });
                setShowForm(true);
              }}
              className="bg-primary-dark text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-light transition"
            >
              Novo Agendamento
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 mb-6 rounded-lg text-center font-medium ${isError ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6 overflow-hidden">
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
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            height="auto"
            locale="pt-br"
            buttonText={{ today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia' }}
            slotEventOverlap={false}
            dayMaxEvents={1} // ← Evita crescimento de linhas
            moreLinkContent={(args) => `+${args.num} mais`}
            eventDidMount={(info) => {
              // Força background no mês
              if (info.view.type === 'dayGridMonth') {
                info.el.style.backgroundColor = info.event.backgroundColor;
                info.el.style.borderColor = 'transparent';
                info.el.style.color = '#fff';
                info.el.style.borderRadius = '4px';
                info.el.style.padding = '2px 4px';
                info.el.style.fontSize = '11px';
              }
            }}
            eventContent={(info) => (
              <div
                className="p-1 text-xs font-medium truncate cursor-pointer"
                title={`${info.timeText} - ${info.event.title}`}
              >
                {info.event.title}
              </div>
            )}
            dayCellContent={(arg) => (
              <div className={arg.isToday ? 'bg-blue-50 rounded p-1 text-center' : 'text-center'}>
                {arg.dayNumberText.replace('º', '')}
              </div>
            )}
          />
        </div>

        <Modal show={showForm} onClose={handleFormClose}>
          <AppointmentForm
            appointment={selectedAppointment}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
          />
        </Modal>

        <ConfirmDialog
          show={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleDelete}
          message="Tem certeza que deseja excluir este agendamento?"
        />
      </div>
    </div>
  );
};

export default CalendarPage;