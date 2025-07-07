// frontend/src/pages/AppointmentList.js

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import appointmentService from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import moment from 'moment'; // NOVO: Importa Moment.js

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

  // Function to fetch all appointments
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentService.getAllAppointments();
      // A resposta do backend agora já vem com 'date' formatado e 'dateOnly', 'timeOnly'
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      // O erro 'utcToZonedTime is not a function' ainda pode aparecer aqui se o backend não foi atualizado
      // ou reconstruído corretamente. A mensagem de erro deve ser mais específica após as correções.
      setError(err.response?.data?.error?.message || 'Error loading appointments. Check your permissions or try again.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only 'admin', 'doctor', and 'secretary' can access this page
    if (currentUser?.role && ['admin', 'doctor', 'secretary'].includes(currentUser.role)) {
      fetchAppointments();
    } else {
      setError('You do not have permission to access this page.');
      setLoading(false);
    }

    // Handles messages passed via navigation state
    if (location.state && location.state.message) {
      setActionMessage(location.state.message);
      setIsActionError(location.state.isError || false);
      navigate(location.pathname, { replace: true, state: {} }); // Clears the message from state
      setTimeout(() => setActionMessage(''), 3000);
    }
  }, [currentUser, location.state, navigate]); // Added 'navigate' to dependencies

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
        setActionMessage('Appointment deleted successfully!');
        setIsActionError(false);
        fetchAppointments(); // Reload the list
      } catch (err) {
        console.error('Error deleting appointment:', err);
        const errorMessage = err.response?.data?.error?.message || 'Error deleting appointment. Check your permissions.';
        setActionMessage(errorMessage);
        setIsActionError(true);
      } finally {
        setAppointmentToDelete(null);
        setTimeout(() => setActionMessage(''), 3000);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light font-sans flex items-center justify-center">
        <p className="text-text-DEFAULT text-lg">Loading appointments...</p>
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
          <h1 className="text-4xl font-bold text-primary-dark">Appointment Management</h1>
          {currentUser?.role && ['admin', 'doctor', 'secretary'].includes(currentUser.role) && (
            <button
              onClick={handleAddAppointment}
              className="bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-DEFAULT transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            >
              New Appointment
            </button>
          )}
        </div>

        {actionMessage && (
          <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isActionError ? 'bg-error text-white' : 'bg-success text-white'}`}>
            {actionMessage}
          </div>
        )}

        {appointments.length === 0 ? (
          <p className="text-center text-text-light text-lg mt-10">No appointments registered yet.</p>
        ) : (
          <div className="overflow-x-auto bg-background-DEFAULT rounded-xl shadow-custom-medium">
            <table className="min-w-full divide-y divide-secondary-dark">
              <thead className="bg-secondary-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Date and Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Insurance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Actions
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
                      {/* appt.date já vem formatado do backend (dd/MM/yyyy HH:mm) */}
                      {appt.date} 
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light capitalize">
                      {appt.type === 'initial' ? 'Initial' : 'Return'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {appt.insurance ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {appt.insurance && appt.insurancePlan ? appt.insurancePlan.name : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditAppointment(appt.id)}
                        className="text-primary-DEFAULT hover:text-primary-dark mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDeleteAppointment(appt.id)}
                        className="text-error hover:text-red-700"
                      >
                        Delete
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
        message="Are you sure you want to delete this appointment?"
      />
    </div>
  );
};

export default AppointmentList;
