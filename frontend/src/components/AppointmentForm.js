// frontend/src/components/AppointmentForm.js
import React, { useState, useEffect } from 'react';
import appointmentService from '../services/appointmentService';
import authService from '../services/authService';
import patientService from '../services/patientService';
import insurancePlanService from '../services/insurancePlanService';
import moment from 'moment';

const AppointmentForm = ({ appointment, onSubmit, onCancel }) => {
  const [doctorId, setDoctorId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [type, setType] = useState('initial');
  const [insurance, setInsurance] = useState(false);
  const [insurancePlanId, setInsurancePlanId] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [insurancePlans, setInsurancePlans] = useState([]);
  const [formLoading, setFormLoading] = useState(true);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const doctorsResponse = await authService.getAllUsers();
        setDoctors(doctorsResponse.data.filter(user => user.role === 'doctor'));

        const patientsResponse = await patientService.getPatients();
        setPatients(patientsResponse);

        const insurancePlansResponse = await insurancePlanService.getAllActiveInsurancePlans();
        setInsurancePlans(insurancePlansResponse.data);
      } catch (err) {
        setMessage('Erro ao carregar dados.');
        setIsError(true);
      } finally {
        setFormLoading(false);
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (appointment) {
      setDoctorId(appointment.doctorId || '');
      setPatientId(appointment.patientId || '');
      setType(appointment.type || 'initial');
      setInsurance(appointment.insurance || false);
      setInsurancePlanId(appointment.insurancePlanId || '');

      if (appointment.dateOnly && appointment.timeOnly) {
        setSelectedDate(appointment.dateOnly);
        setSelectedTime(appointment.timeOnly);
      } else if (appointment.date) {
        const parsed = moment(appointment.date, 'DD/MM/YYYY HH:mm');
        if (parsed.isValid()) {
          setSelectedDate(parsed.format('YYYY-MM-DD'));
          setSelectedTime(parsed.format('HH:mm'));
        }
      }
    } else {
      setDoctorId('');
      setPatientId('');
      setSelectedDate('');
      setSelectedTime('');
      setType('initial');
      setInsurance(false);
      setInsurancePlanId('');
    }
    setMessage('');
    setIsError(false);
  }, [appointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    if (!selectedDate || !selectedTime) {
      setMessage('Data e hora são obrigatórias.');
      setIsError(true);
      setLoading(false);
      return;
    }

    const localDateTime = `${selectedDate}T${selectedTime}:00`;
    const isoDate = new Date(localDateTime).toISOString();

    if (!isoDate || isoDate === 'Invalid Date') {
      setMessage('Data ou hora inválida.');
      setIsError(true);
      setLoading(false);
      return;
    }

    const appointmentData = {
      doctorId,
      patientId,
      date: isoDate,
      type,
      insurance,
      insurancePlanId: insurance ? insurancePlanId : null,
    };

    try {
      if (appointment?.id) {
        await appointmentService.updateAppointment(appointment.id, appointmentData);
        setMessage('Agendamento atualizado com sucesso!');
        onSubmit('Agendamento atualizado com sucesso!', false);
      } else {
        await appointmentService.createAppointment(appointmentData);
        setMessage('Agendamento criado com sucesso!');
        onSubmit('Agendamento criado com sucesso!', false);
        // Limpa apenas se sucesso
        setDoctorId('');
        setPatientId('');
        setSelectedDate('');
        setSelectedTime('');
        setType('initial');
        setInsurance(false);
        setInsurancePlanId('');
      }
      setIsError(false);
    } catch (err) {
      console.error('Erro ao salvar:', err);
      const errorMsg = err.response?.data?.error || 'Erro ao salvar. Tente novamente.';
      setMessage(errorMsg);
      setIsError(true);
      // NÃO chama onSubmit com erro → mantém formulário aberto
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment?.id) return;
    try {
      await appointmentService.deleteAppointment(appointment.id);
      setMessage('Agendamento excluído com sucesso!');
      onSubmit('Agendamento excluído com sucesso!', false);
    } catch (err) {
      setMessage('Erro ao excluir.');
      setIsError(true);
    }
  };

  if (formLoading) {
    return <div className="text-center p-6">Carregando...</div>;
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-primary-dark mb-6 text-center">
        {appointment?.id ? 'Editar Agendamento' : 'Novo Agendamento'}
      </h2>

      {message && (
        <div className={`p-4 mb-6 rounded-lg text-center font-medium ${isError ? 'bg-red-700 text-red-100 border border-red-300' : 'bg-green-700 text-green-100 border border-green-300'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Médico */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Médico</label>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-dark"
            required
          >
            <option value="">Selecione</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        {/* Paciente */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Paciente</label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-dark"
            required
          >
            <option value="">Selecione</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Data e Hora */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Data</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-dark"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hora</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-dark"
              required
            />
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-dark"
          >
            <option value="initial">Inicial</option>
            <option value="return">Retorno</option>
          </select>
        </div>

        {/* Convênio */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={insurance}
            onChange={(e) => {
              setInsurance(e.target.checked);
              if (!e.target.checked) setInsurancePlanId('');
            }}
            className="h-5 w-5 text-primary-dark"
          />
          <label className="text-sm font-semibold">Convênio</label>
        </div>

        {insurance && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Plano</label>
            <select
              value={insurancePlanId}
              onChange={(e) => setInsurancePlanId(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-dark"
              required
            >
              <option value="">Selecione</option>
              {insurancePlans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-dark text-white py-3 rounded-lg font-bold hover:bg-primary-light hover:scale-105 transition transform"
          >
            {loading ? 'Salvando...' : (appointment?.id ? 'Salvar' : 'Agendar')}
          </button>

          {appointment?.id && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 hover:scale-105 transition transform"
            >
              Excluir
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-400 transition"
          >            
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;