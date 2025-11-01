// frontend/src/components/AppointmentForm.js

import React, { useState, useEffect } from 'react';
import appointmentService from '../services/appointmentService';
import authService from '../services/authService';
import patientService from '../services/patientService';
import insurancePlanService from '../services/insurancePlanService';
import moment from 'moment';

const AppointmentForm = ({ appointment, onSubmit }) => {
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

  // Carregar dados dos dropdowns
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
        console.error('Erro ao carregar dados:', err);
        setMessage('Erro ao carregar médicos, pacientes ou planos.');
        setIsError(true);
      } finally {
        setFormLoading(false);
      }
    };
    fetchDropdownData();
  }, []);

  // Preencher formulário ao editar
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

  // SUBSTITUA TODO O handleSubmit POR ESTE:
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    // VALIDAÇÃO: data e hora obrigatórias
    if (!selectedDate || !selectedTime) {
      setMessage('Data e hora são obrigatórias.');
      setIsError(true);
      setLoading(false);
      return;
    }

    // COMBINA DATA E HORA → ISO 8601 UTC
    const localDateTime = `${selectedDate}T${selectedTime}:00`; // 2025-11-01T10:30:00
    const isoDate = new Date(localDateTime).toISOString(); // → 2025-11-01T13:30:00.000Z (UTC)

    if (!isoDate || isoDate === 'Invalid Date') {
      setMessage('Data ou hora inválida.');
      setIsError(true);
      setLoading(false);
      return;
    }

    const appointmentData = {
      doctorId,
      patientId,
      date: isoDate, // ISO 8601 UTC
      type,
      insurance,
      insurancePlanId: insurance ? insurancePlanId : null,
    };

    try {
      if (appointment?.id) {
        // EDITAR
        await appointmentService.updateAppointment(appointment.id, appointmentData);
        setMessage('Agendamento atualizado com sucesso!');
        onSubmit('Agendamento atualizado com sucesso!', false);
      } else {
        // CRIAR
        await appointmentService.createAppointment(appointmentData);
        setMessage('Agendamento criado com sucesso!');
        onSubmit('Agendamento criado com sucesso!', false);

        // Limpar formulário
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
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Erro ao salvar. Tente novamente.';
      setMessage(errorMsg);
      setIsError(true);
      onSubmit(errorMsg, true);
    } finally {
      setLoading(false);
    }
  };

  if (formLoading) {
    return (
      <div className="bg-background-DEFAULT p-6 rounded-xl shadow-custom-medium text-center text-text-DEFAULT">
        Carregando formulário...
      </div>
    );
  }

  return (
    <div className="bg-background-DEFAULT p-6 rounded-xl shadow-custom-medium">
      <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
        {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
      </h2>

      {message && (
        <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isError ? 'bg-error text-white' : 'bg-success text-white'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="doctorId">
            Médico
          </label>
          <select
            id="doctorId"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light bg-white"
            required
          >
            <option value="">Selecione um médico</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>{doc.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="patientId">
            Paciente
          </label>
          <select
            id="patientId"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light bg-white"
            required
          >
            <option value="">Selecione um paciente</option>
            {patients.map((pat) => (
              <option key={pat.id} value={pat.id}>{pat.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="appointmentDate">
              Data
            </label>
            <input
              type="date"
              id="appointmentDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="appointmentTime">
              Hora
            </label>
            <input
              type="time"
              id="appointmentTime"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="appointmentType">
            Tipo de Consulta
          </label>
          <select
            id="appointmentType"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light bg-white"
            required
          >
            <option value="initial">Inicial</option>
            <option value="return">Retorno</option>
          </select>
        </div>

        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="appointmentInsurance"
            checked={insurance}
            onChange={(e) => {
              setInsurance(e.target.checked);
              if (!e.target.checked) setInsurancePlanId('');
            }}
            className="mr-2 h-4 w-4 text-primary-DEFAULT rounded border-gray-300 focus:ring-primary-light"
          />
          <label className="text-text-light text-sm font-semibold" htmlFor="appointmentInsurance">
            Convênio
          </label>
        </div>

        {insurance && (
          <div className="mb-4">
            <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="insurancePlanId">
              Plano de Saúde
            </label>
            <select
              id="insurancePlanId"
              value={insurancePlanId}
              onChange={(e) => setInsurancePlanId(e.target.value)}
              className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light bg-white"
              required={insurance}
            >
              <option value="">Selecione um plano</option>
              {insurancePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-primary-dark text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light transition transform hover:scale-105"
          disabled={loading}
        >
          {loading ? 'Salvando...' : (appointment ? 'Salvar Alterações' : 'Agendar')}
        </button>
      </form>
    </div>
  );
};

export default AppointmentForm;