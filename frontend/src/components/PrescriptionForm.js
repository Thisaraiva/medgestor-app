// C:\Programacao\Projetos\JavaScript\medgestor-app\frontend\src\components\PrescriptionForm.js

import React, { useState, useEffect } from 'react';
import prescriptionService from '../services/prescriptionService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PrescriptionForm = ({ prescription, patientId, patient, onSuccess }) => {
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [administrationInstructions, setAdministrationInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [dateIssued, setDateIssued] = useState('');
  const [status, setStatus] = useState('active');

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (prescription) {
      setMedication(prescription.medication || '');
      setDosage(prescription.dosage || '');
      setFrequency(prescription.frequency || '');
      setDuration(prescription.duration || '');
      setAdministrationInstructions(prescription.administrationInstructions || '');
      setNotes(prescription.notes || '');
      // Formata a data para o formato de input 'date' (YYYY-MM-DD)
      setDateIssued(prescription.dateIssued ? prescription.dateIssued.split('T')[0] : '');
      setStatus(prescription.status || 'active');
    } else {
      setMedication('');
      setDosage('');
      setFrequency('');
      setDuration('');
      setAdministrationInstructions('');
      setNotes('');
      setDateIssued(new Date().toISOString().split('T')[0]);
      setStatus('active');
    }

    setMessage('');
    setIsError(false);
  }, [prescription]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    // Objeto com os dados para a prescrição, incluindo doctorId para criação.
    const prescriptionData = {
      medication,
      dosage,
      frequency,
      duration,
      administrationInstructions,
      notes,
      dateIssued,
      status,
    };

    try {
      if (prescription) {
        // Na atualização, o doctorId não deve ser enviado no corpo da requisição.
        // O backend já sabe qual prescrição atualizar através do ID na URL.
        await prescriptionService.updatePrescription(prescription.id, prescriptionData);
        setMessage('Prescrição atualizada com sucesso!');
      } else {
        // Na criação, o patientId e o doctorId são necessários para vincular a prescrição.
        const newPrescriptionData = {
          ...prescriptionData,
          patientId,
          doctorId: user.id,
        };
        await prescriptionService.createPrescription(newPrescriptionData);
        setMessage('Prescrição criada com sucesso!');
      }
      setIsError(false);
      onSuccess(); // Chama onSuccess sem passar dados
    } catch (err) {
      console.error('Erro ao salvar prescrição:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Erro ao salvar prescrição. Tente novamente.';
      setMessage(errorMessage);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-DEFAULT p-6 rounded-xl shadow-custom-medium">
      <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
        {prescription ? 'Editar Prescrição' : 'Nova Prescrição'}
      </h2>

      {message && (
        <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isError ? 'bg-error text-white' : 'bg-success text-white'}`}>
          {message}
        </div>
      )}

      {patient && (
        <div className="text-center mb-4">
          <p className="font-semibold text-text-DEFAULT">Paciente: {patient.name}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="medication">
            Medicação
          </label>
          <input
            type="text"
            id="medication"
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="dosage">
            Dosagem
          </label>
          <input
            type="text"
            id="dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
          />
        </div>

        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="frequency">
            Frequência
          </label>
          <input
            type="text"
            id="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
          />
        </div>

        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="duration">
            Duração
          </label>
          <input
            type="text"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
          />
        </div>

        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="administrationInstructions">
            Instruções de Administração
          </label>
          <textarea
            id="administrationInstructions"
            value={administrationInstructions}
            onChange={(e) => setAdministrationInstructions(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
            rows="3"
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="notes">
            Observações
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
            rows="3"
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="dateIssued">
            Data de Emissão
          </label>
          <input
            type="date"
            id="dateIssued"
            value={dateIssued}
            onChange={(e) => setDateIssued(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200 bg-white"
            required
          >
            <option value="active">Ativa</option>
            <option value="inactive">Inativa</option>
            <option value="expired">Expirada</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-primary-dark text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
          disabled={loading}
        >
          {loading ? 'Salvando...' : (prescription ? 'Salvar Alterações' : 'Criar Prescrição')}
        </button>
      </form>
    </div>
  );
};

export default PrescriptionForm;
