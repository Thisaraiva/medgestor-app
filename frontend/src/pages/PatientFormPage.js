// frontend/src/pages/PatientFormPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PatientForm from '../components/PatientForm';
import patientService from '../services/patientService';

const PatientFormPage = () => {
  const { id } = useParams(); // Obtém o ID do paciente da URL (se estiver em modo de edição)
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      if (id) { // Se houver um ID na URL, estamos em modo de edição
        try {
          const fetchedPatient = await patientService.getPatientById(id);
          setPatient(fetchedPatient);
        } catch (err) {
          console.error('Erro ao buscar paciente para edição:', err);
          setError('Erro ao carregar dados do paciente para edição.');
        } finally {
          setLoading(false);
        }
      } else { // Se não houver ID, estamos em modo de adição
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  const handleFormSubmit = (message, isError) => {
    // Após a submissão do formulário, exibe a mensagem e redireciona para a lista de pacientes
    // Você pode querer exibir a mensagem de sucesso/erro de forma mais persistente aqui,
    // ou passá-la para a PatientList através de um serviço de notificação global.
    console.log('Formulário de paciente submetido:', message, 'Erro:', isError);
    // Redireciona para a lista de pacientes após um breve atraso
    setTimeout(() => {
      navigate('/patients', { state: { message, isError } }); // Passa a mensagem via state
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
        <div className="w-full max-w-2xl"> {/* Ajuste a largura conforme necessário */}
          <PatientForm patient={patient} onSubmit={handleFormSubmit} />
        </div>
      </div>
    </div>
  );
};

export default PatientFormPage;
