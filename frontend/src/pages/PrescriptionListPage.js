// C:\Programacao\Projetos\JavaScript\medgestor-app\frontend\src\pages\PrescriptionListPage.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PrescriptionList from '../components/PrescriptionList';
import patientService from '../services/patientService';

const PrescriptionListPage = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      setLoadingPatient(true);
      setError(null);
      try {
        const patientData = await patientService.getPatientById(patientId);
        setPatient(patientData);
      } catch (err) {
        console.error('Erro ao buscar dados do paciente:', err);
        const errorMessage = err.response?.data?.message || 'Erro ao carregar os dados do paciente. Tente novamente.';
        setError(errorMessage);
      } finally {
        setLoadingPatient(false);
      }
    };
    
    if (patientId) {
      fetchPatient();
    } else {
      setLoadingPatient(false);
      setError('ID do paciente não fornecido.');
    }
  }, [patientId]);

  if (loadingPatient) {
    return (
      <div className="min-h-screen bg-background-light font-sans flex justify-center items-center text-xl text-primary-dark">
        Carregando dados do paciente...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background-light font-sans flex justify-center items-center text-xl text-error">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light font-sans">
      <Navbar />
      <div className="max-w-4xl mx-auto p-4">
        <PrescriptionList patientId={patientId} patient={patient} />
      </div>
    </div>
  );
};

export default PrescriptionListPage;
