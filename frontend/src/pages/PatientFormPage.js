// frontend/src/pages/PatientFormPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PatientForm from '../components/PatientForm';
import patientService from '../services/patientService';
import Modal from '../components/Modal';

const PatientFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [patient, setPatient] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      if (id) {
        try {
          const data = await patientService.getPatientById(id);
          setPatient(data);
        } catch (_err) {
          setError('Erro ao carregar paciente.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchPatient();

    // Limpa estado de navegação
    if (location.state) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [id, location, navigate]);

  const handleSubmit = (message, isError) => {
    if (!isError) {
      setTimeout(() => {
        navigate('/patients', { state: { message, isError } });
      }, 1000);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setTimeout(() => {
      navigate('/patients');
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <p className="text-error text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <Navbar />
      <Modal show={showModal} onClose={handleCancel}>
        <PatientForm
          patient={patient}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>
    </div>
  );
};

export default PatientFormPage;