// frontend/src/components/AppointmentForm.js

import React, { useState, useEffect } from 'react';
import appointmentService from '../services/appointmentService';
import authService from '../services/authService'; // To fetch doctors
import patientService from '../services/patientService'; // To fetch patients
import insurancePlanService from '../services/insurancePlanService'; // NEW: To fetch insurance plans
import moment from 'moment'; // Importa Moment.js

/**
 * Form component for adding or editing appointments.
 *
 * @param {object} props - Component properties.
 * @param {object} [props.appointment] - Appointment object for editing. If null, it's an add form.
 * @param {function} props.onSubmit - Function to be called after successful submission.
 */
const AppointmentForm = ({ appointment, onSubmit }) => {
  const [doctorId, setDoctorId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); // State for date input (YYYY-MM-DD)
  const [selectedTime, setSelectedTime] = useState(''); // State for time input (HH:mm)
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

  // Effect to fetch dropdown data (doctors, patients, insurance plans)
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const doctorsResponse = await authService.getAllUsers();
        setDoctors(doctorsResponse.data.filter(user => user.role === 'doctor'));

        const patientsResponse = await patientService.getPatients();
        setPatients(patientsResponse);

        const insurancePlansResponse = await insurancePlanService.getAllInsurancePlans();
        setInsurancePlans(insurancePlansResponse.data);

      } catch (err) {
        console.error('Error loading data for dropdowns:', err);
        setMessage('Error loading doctors, patients, or insurance plans.');
        setIsError(true);
      } finally {
        setFormLoading(false);
      }
    };
    fetchDropdownData();
  }, []);

  // Populates the form if an appointment is passed for editing
  useEffect(() => {
    if (appointment) {
      setDoctorId(appointment.doctorId || '');
      setPatientId(appointment.patientId || '');
      setType(appointment.type || 'initial');
      setInsurance(appointment.insurance || false);
      setInsurancePlanId(appointment.insurancePlanId || '');

      // Populate date and time fields separately from backend's formatted date
      if (appointment.dateOnly && appointment.timeOnly) {
        setSelectedDate(appointment.dateOnly); // YYYY-MM-DD
        setSelectedTime(appointment.timeOnly); // HH:mm
      } else if (appointment.date) {
        // Fallback if dateOnly/timeOnly are not provided by backend (older data)
        // This assumes appointment.date is in 'DD/MM/YYYY HH:mm' format from backend
        const parsed = moment(appointment.date, 'DD/MM/YYYY HH:mm'); // Usando moment para parsear
        if (parsed.isValid()) { // Usando isValid() do moment
          setSelectedDate(parsed.format('YYYY-MM-DD')); // Usando format() do moment
          setSelectedTime(parsed.format('HH:mm')); // Usando format() do moment
        }
      }
    } else {
      // Clears the form if no appointment for editing
      setDoctorId('');
      setPatientId('');
      setSelectedDate('');
      setSelectedTime('');
      setType('initial');
      setInsurance(false);
      setInsurancePlanId('');
    }
    setMessage(''); // Clears messages when changing appointment/mode
    setIsError(false);
  }, [appointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    // Combine selected date and time into an ISO 8601 string for the backend
    let combinedDateTime = null;
    if (selectedDate && selectedTime) {
      try {
        // Cria um objeto Moment no fuso horário local e depois converte para ISO 8601 (UTC)
        const localMoment = moment(`${selectedDate}T${selectedTime}`); // Cria Moment no fuso horário local
        
        if (!localMoment.isValid()) { // Usando isValid() do moment
          throw new Error('Invalid date or time selected.');
        }

        combinedDateTime = localMoment.toISOString(); // Converte para ISO 8601 (UTC)
      } catch (error) {
        setMessage(`Erro ao combinar data e hora: ${error.message}`);
        setIsError(true);
        setLoading(false);
        return; // Stop submission
      }
    } else {
      setMessage('Data e hora são obrigatórias.');
      setIsError(true);
      setLoading(false);
      return; // Stop submission
    }

    const appointmentData = {
      doctorId,
      patientId,
      date: combinedDateTime, // Send as ISO 8601 string
      type,
      insurance,
      insurancePlanId: insurance ? insurancePlanId : null,
    };

    try {
      if (appointment) {
        await appointmentService.updateAppointment(appointment.id, appointmentData);
        setMessage('Appointment updated successfully!');
        onSubmit('Appointment updated successfully!', false);
      } else {
        await appointmentService.createAppointment(appointmentData);
        setMessage('Appointment created successfully!');
        onSubmit('Appointment created successfully!', false);
        // Clears the form after creation
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
      console.error('Error saving appointment:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Error saving appointment. Please try again.';
      setMessage(errorMessage);
      setIsError(true);
      onSubmit(errorMessage, true);
    } finally {
      setLoading(false);
    }
  };

  if (formLoading) {
    return (
      <div className="bg-background-DEFAULT p-6 rounded-xl shadow-custom-medium text-center text-text-DEFAULT">
        Loading form data...
      </div>
    );
  }

  return (
    <div className="bg-background-DEFAULT p-6 rounded-xl shadow-custom-medium">
      <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
        {appointment ? 'Edit Appointment' : 'New Appointment'}
      </h2>

      {message && (
        <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isError ? 'bg-error text-white' : 'bg-success text-white'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="doctorId">
            Doctor
          </label>
          <select
            id="doctorId"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200 bg-white"
            required
          >
            <option value="">Select a doctor</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="patientId">
            Patient
          </label>
          <select
            id="patientId"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200 bg-white"
            required
          >
            <option value="">Select a patient</option>
            {patients.map((pat) => (
              <option key={pat.id} value={pat.id}>
                {pat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Separated Date and Time Inputs */}
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="appointmentDate">
              Date
            </label>
            <input
              type="date"
              id="appointmentDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="appointmentTime">
              Time
            </label>
            <input
              type="time"
              id="appointmentTime"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="appointmentType">
            Appointment Type
          </label>
          <select
            id="appointmentType"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200 bg-white"
            required
          >
            <option value="initial">Initial</option>
            <option value="return">Return</option>
          </select>
        </div>

        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="appointmentInsurance"
            checked={insurance}
            onChange={(e) => {
              setInsurance(e.target.checked);
              if (!e.target.checked) { // If unchecking insurance, clear plan selection
                setInsurancePlanId('');
              }
            }}
            className="mr-2 h-4 w-4 text-primary-DEFAULT rounded border-gray-300 focus:ring-primary-light"
          />
          <label className="text-text-light text-sm font-semibold" htmlFor="appointmentInsurance">
            Insurance
          </label>
        </div>

        {insurance && (
          <div className="mb-4">
            <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="insurancePlanId">
              Insurance Plan
            </label>
            <select
              id="insurancePlanId"
              value={insurancePlanId}
              onChange={(e) => setInsurancePlanId(e.target.value)}
              className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200 bg-white"
              required={insurance}
            >
              <option value="">Select a plan</option>
              {insurancePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-primary-dark text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
          disabled={loading}
        >
          {loading ? 'Saving...' : (appointment ? 'Save Changes' : 'Schedule Appointment')}
        </button>
      </form>
    </div>
  );
};

export default AppointmentForm;
