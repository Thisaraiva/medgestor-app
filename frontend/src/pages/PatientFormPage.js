// frontend/src/pages/PatientFormPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PatientForm from '../components/PatientForm';
import patientService from '../services/patientService';

const PatientFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      if (id) {
        try {
          const fetchedPatient = await patientService.getPatientById(id);
          setPatient(fetchedPatient);
        } catch (err) {
          console.error('Erro ao buscar paciente para edição:', err);
          setError('Erro ao carregar dados do paciente para edição.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  const handleFormSubmit = (message, isError) => {
    console.log('Formulário de paciente submetido:', message, 'Erro:', isError);
    setTimeout(() => {
      navigate('/patients', { state: { message, isError } });
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light font-sans flex items-center justify-center">
        <p className="text-text-DEFAULT text-lg">Carregando formulário...</p>
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
        <div className="w-full max-w-2xl">
          <PatientForm patient={patient} onSubmit={handleFormSubmit} />
        </div>
      </div>
    </div>
  );
};

export default PatientFormPage;