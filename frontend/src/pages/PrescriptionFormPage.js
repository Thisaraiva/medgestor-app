// C:\Programacao\Projetos\JavaScript\medgestor-app\frontend\src\pages\PrescriptionFormPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PrescriptionForm from '../components/PrescriptionForm';
import prescriptionService from '../services/prescriptionService';
import patientService from '../services/patientService';

const PrescriptionFormPage = () => {
  const { patientId, prescriptionId } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const patientData = await patientService.getPatientById(patientId);
        setPatient(patientData);

        if (prescriptionId) {
          const prescriptionData = await prescriptionService.getPrescriptionById(prescriptionId);
          setPrescription(prescriptionData);
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        const errorMessage = err.response?.data?.message || 'Erro ao carregar os dados. Tente novamente.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    if (patientId) {
      fetchData();
    } else {
      setLoading(false);
      setError('ID do paciente não fornecido.');
    }
  }, [patientId, prescriptionId]);

  const handleSuccess = () => {
    navigate(`/patients/${patientId}/prescriptions`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-primary-dark">
        Carregando formulário...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-error">
        {error}
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background-light font-sans">
      <Navbar />
      <div className="max-w-xl mx-auto">
        <PrescriptionForm
          patientId={patientId}
          prescription={prescription}
          patient={patient} // Passando os dados do paciente
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};

export default PrescriptionFormPage;