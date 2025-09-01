// frontend/src/pages/RecordFormPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RecordForm from '../components/RecordForm';
import medicalRecordService from '../services/medicalRecordService';
import patientService from '../services/patientService';

const RecordFormPage = () => {
  const { patientId, recordId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let patientData = null;
        let recordData = null;

        if (recordId) {
          // Modo de Edição
          recordData = await medicalRecordService.getRecordById(recordId);
          patientData = recordData.patient;
        } else if (patientId) {
          // Modo de Criação
          patientData = await patientService.getPatientById(patientId);
        }

        if (!patientData) {
          throw new Error('Paciente não encontrado.');
        }

        setPatient(patientData);
        if (recordData) {
          setInitialData(recordData);
        } else {
          setInitialData({ patientId });
        }
        
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError('Erro ao carregar os dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [recordId, patientId]);

  const handleSave = () => {
    navigate(`/patients/${patientId}/medical-records`, { replace: true });
  };

  const handleCancel = () => {
    navigate(`/patients/${patientId}/medical-records`, { replace: true });
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
  
  const patientName = patient?.name || 'Paciente';

  return (
    <div className="min-h-screen bg-background-light font-sans">
      <Navbar />
      <div className="container mx-auto p-6 flex justify-center">
        <div className="w-full max-w-3xl">
          <h1 className="text-3xl font-bold text-primary-dark mb-6 text-center">
            {recordId ? 'Editar Prontuário' : 'Novo Prontuário'} para {patientName}
          </h1>
          <RecordForm
            patientId={patientId}
            recordId={recordId}
            initialData={initialData}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default RecordFormPage;