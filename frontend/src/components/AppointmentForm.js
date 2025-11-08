// frontend/src/components/AppointmentForm.js
import React, { useState, useEffect } from 'react';
import appointmentService from '../services/appointmentService';
import authService from '../services/authService';
import insurancePlanService from '../services/insurancePlanService';
import moment from 'moment-timezone';
import { APP_TIMEZONE } from '../utils/dateUtils';
import PatientSearchSelect from './PatientSearchSelect'; // NOVO

const AppointmentForm = ({ appointment, onSubmit, onCancel, onDelete }) => {
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
  const [deleting, setDeleting] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [insurancePlans, setInsurancePlans] = useState([]);
  const [formLoading, setFormLoading] = useState(true);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [doctorsRes, plansRes] = await Promise.all([
          authService.getAllUsers(),
          insurancePlanService.getAllActiveInsurancePlans()
        ]);
        const doctorList = doctorsRes.data.filter(user => user.role === 'doctor');
        // Ordena médicos alfabeticamente
        doctorList.sort((a, b) => a.name.localeCompare(b.name));
        setDoctors(doctorList);
        setInsurancePlans(plansRes.data);
      } catch (err) {
        setMessage('Erro ao carregar dados para o formulário.');
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
        try {
          const parsed = moment.tz(appointment.date, 'DD/MM/YYYY HH:mm', APP_TIMEZONE);
          if (parsed.isValid()) {
            setSelectedDate(parsed.format('YYYY-MM-DD'));
            setSelectedTime(parsed.format('HH:mm'));
          }
        } catch (error) {
          console.error('Erro ao parsear data:', error);
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

    if (!doctorId || !patientId || !selectedDate || !selectedTime) {
      setMessage('Todos os campos são obrigatórios.');
      setIsError(true);
      setLoading(false);
      return;
    }

    try {
      const localDateTime = moment.tz(
        `${selectedDate} ${selectedTime}`,
        'YYYY-MM-DD HH:mm',
        APP_TIMEZONE
      );
      if (!localDateTime.isValid()) throw new Error('Data inválida');

      const isoDate = localDateTime.utc().toISOString();
      const appointmentData = {
        doctorId,
        patientId,
        date: isoDate,
        type,
        insurance,
        insurancePlanId: insurance ? insurancePlanId : null,
      };

      let result;
      if (appointment?.id) {
        result = await appointmentService.updateAppointment(appointment.id, appointmentData);
        setMessage('Agendamento atualizado com sucesso!');
      } else {
        result = await appointmentService.createAppointment(appointmentData);
        setMessage('Agendamento criado com sucesso!');
        // Limpa apenas em sucesso
        setDoctorId('');
        setPatientId('');
        setSelectedDate('');
        setSelectedTime('');
        setType('initial');
        setInsurance(false);
        setInsurancePlanId('');
      }

      setIsError(false);
      onSubmit(result.data?.message || 'Agendamento criado com sucesso!', false);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao salvar. Tente novamente.';
      setMessage(errorMsg);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = () => {
    if (appointment?.id && onDelete) onDelete(appointment.id);
  };

  if (formLoading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl mx-auto text-center">
        <p className="text-text-DEFAULT text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-primary-dark mb-6 text-center">
        {appointment?.id ? 'Editar Agendamento' : 'Novo Agendamento'}
      </h2>

      {message && (
        <div className={`p-4 mb-6 rounded-lg text-center font-medium ${
          isError
            ? 'bg-red-100 text-red-700 border border-red-300'
            : 'bg-green-100 text-green-700 border border-green-300'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Médico */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Médico *</label>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark"
            required
            disabled={loading || deleting}
          >
            <option value="">Selecione um médico</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
            ))}
          </select>
        </div>

        {/* Paciente com BUSCA */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Paciente *</label>
          <PatientSearchSelect
            value={patientId}
            onChange={setPatientId}
            disabled={loading || deleting}
          />
        </div>

        {/* Data e Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Data *</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark"
              required
              disabled={loading || deleting}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hora *</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark"
              required
              disabled={loading || deleting}
              step="1800"
            />
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Consulta *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark"
            required
            disabled={loading || deleting}
          >
            <option value="initial">Consulta Inicial</option>
            <option value="return">Retorno</option>
          </select>
        </div>

        {/* Convênio */}
        <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg">
          <input
            type="checkbox"
            id="insurance"
            checked={insurance}
            onChange={(e) => {
              setInsurance(e.target.checked);
              if (!e.target.checked) setInsurancePlanId('');
            }}
            className="h-5 w-5 text-primary-dark rounded focus:ring-2"
            disabled={loading || deleting}
          />
          <label htmlFor="insurance" className="text-sm font-semibold text-gray-700">
            É por convênio?
          </label>
        </div>

        {insurance && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Plano de Saúde *</label>
            <select
              value={insurancePlanId}
              onChange={(e) => setInsurancePlanId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark"
              required
              disabled={loading || deleting}
            >
              <option value="">Selecione um plano</option>
              {insurancePlans.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Botões */}
        <div className={`flex gap-4 pt-4 ${appointment?.id ? 'flex-col sm:flex-row' : 'flex-row'}`}>
          <button
            type="submit"
            disabled={loading || deleting}
            className={`flex-1 bg-primary-dark text-white py-3 rounded-lg font-bold hover:bg-primary-light disabled:bg-gray-400 transition`}
          >
            {loading ? 'Salvando...' : (appointment?.id ? 'Atualizar' : 'Agendar')}
          </button>

          {appointment?.id && (
            <button
              type="button"
              onClick={handleDeleteRequest}
              disabled={loading || deleting}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-400"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            disabled={loading || deleting}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;