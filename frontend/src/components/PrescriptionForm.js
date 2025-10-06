import React, { useState, useEffect } from 'react';
import prescriptionService from '../services/prescriptionService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import moment from 'moment'; // Importamos moment para formatação de data

const PrescriptionForm = ({ prescription, patientId, patient, onSuccess }) => {
  // 1. Estados
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

  // 2. Efeito para inicialização do formulário
  useEffect(() => {
    setMessage('');
    setIsError(false);

    if (prescription) {
      setMedication(prescription.medication || '');
      setDosage(prescription.dosage || '');
      setFrequency(prescription.frequency || '');
      setDuration(prescription.duration || '');
      setAdministrationInstructions(prescription.administrationInstructions || '');
      setNotes(prescription.notes || '');
      
      // Usamos moment para garantir a formatação correta YYYY-MM-DD
      const formattedDate = prescription.dateIssued ? moment(prescription.dateIssued).format('YYYY-MM-DD') : '';
      setDateIssued(formattedDate);
      setStatus(prescription.status || 'active');
    } else {
      setMedication('');
      setDosage('');
      setFrequency('');
      setDuration('');
      setAdministrationInstructions('');
      setNotes('');
      // Define a data de hoje como padrão para nova prescrição
      setDateIssued(moment().format('YYYY-MM-DD'));
      setStatus('active');
    }
  }, [prescription]);

  // 3. Função de Submissão
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    // Objeto com os dados para a prescrição
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
        // ATUALIZAÇÃO: doctorId não é enviado.
        // Aplicando a boa prática de filtrar campos vazios/nulos, consistente com PatientForm.js
        const dataToUpdate = Object.fromEntries(
          Object.entries(prescriptionData).filter(([, value]) => value !== null && value !== '')
        );

        await prescriptionService.updatePrescription(prescription.id, dataToUpdate);
        setMessage('Prescrição atualizada com sucesso!');
      } else {
        // CRIAÇÃO: Adicionamos apenas o patientId. doctorId é injetado pelo backend (segurança).
        const newPrescriptionData = {
          ...prescriptionData,
          patientId,
          // doctorId foi removido daqui, pois deve ser injetado pelo backend via middleware (Auth)
        };
        await prescriptionService.createPrescription(newPrescriptionData);
        setMessage('Prescrição criada com sucesso!');
      }
      setIsError(false);
      onSuccess();
    } catch (err) {
      console.error('Erro ao salvar prescrição:', err.response?.data?.message || err.message);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Erro ao salvar prescrição. Tente novamente.';
      setMessage(errorMessage);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  // 4. Renderização (com ajuste de mb-4 para mb-3 para layout mais compacto)
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
        {/* Usando mb-3 para um espaçamento mais compacto, emulando a formatação desejada */}
        <div className="mb-3">
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

        <div className="mb-3">
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

        <div className="mb-3">
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

        <div className="mb-3">
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

        <div className="mb-3">
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

        <div className="mb-3">
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

        <div className="mb-3">
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

        {/* Último campo mantém mb-6 para o espaçamento antes do botão */}
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