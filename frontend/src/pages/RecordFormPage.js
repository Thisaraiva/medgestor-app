// frontend/src/pages/RecordFormPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RecordForm from '../components/RecordForm'; // Importa o componente de formulário
import medicalRecordService from '../services/medicalRecordService';
import patientService from '../services/patientService';

const RecordFormPage = () => {
  const { patientId, recordId } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [patientName, setPatientName] = useState('Paciente');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (recordId) {
          // Modo de Edição
          const record = await medicalRecordService.getRecordById(recordId);
          setInitialData(record);
          setPatientName(record.patient.name);
        } else if (patientId) {
          // Modo de Criação
          const patient = await patientService.getPatientById(patientId);
          setPatientName(patient.name);
          setInitialData({ patientId, appointmentId: null });
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
    // Redireciona para a página de visualização de prontuários do paciente
    navigate(`/patients/${patientId}/medical-records`);
  };

  const handleCancel = () => {
    // Retorna para a página de visualização de prontuários do paciente
    navigate(`/patients/${patientId}/medical-records`);
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
        <div className="w-full max-w-3xl">
          <h1 className="text-3xl font-bold text-primary-dark mb-6 text-center">
            {recordId ? 'Editar Prontuário' : 'Novo Prontuário'} para {patientName}
          </h1>
          <RecordForm
            patientId={patientId}
            recordId={recordId}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default RecordFormPage;