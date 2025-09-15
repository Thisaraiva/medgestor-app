// C:\Programacao\Projetos\JavaScript\medgestor-app\frontend\src\components\PrescriptionList.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import prescriptionService from '../services/prescriptionService';
import { FaPlus, FaEdit, FaTrash, FaPrint } from 'react-icons/fa';
import moment from 'moment';
import ConfirmDialog from './ConfirmDialog';

const PrescriptionList = ({ patientId, patient }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState(null);
  const navigate = useNavigate();

  // Função para buscar as prescrições
  const fetchPrescriptions = async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedPrescriptions = await prescriptionService.getPrescriptionsByPatient(patientId);
      setPrescriptions(fetchedPrescriptions);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      const errorMessage = err.response?.data?.error || 'Erro ao buscar prescrições. Tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  const handleEdit = (prescriptionId) => {
    navigate(`/patients/${patientId}/prescriptions/edit/${prescriptionId}`);
  };

  const handleNew = () => {
    navigate(`/patients/${patientId}/prescriptions/new`);
  };

  const handleDeleteClick = (prescriptionId) => {
    setPrescriptionToDelete(prescriptionId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    if (!prescriptionToDelete) return;
    try {
      await prescriptionService.deletePrescription(prescriptionToDelete);
      setPrescriptions(prescriptions.filter(p => p.id !== prescriptionToDelete));
      setPrescriptionToDelete(null);
    } catch (err) {
      console.error('Erro ao excluir prescrição:', err);
      const errorMessage = err.response?.data?.error || 'Erro ao excluir prescrição. Tente novamente.';
      setError(errorMessage);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setPrescriptionToDelete(null);
  };
    
  const handlePrint = (prescriptionId) => {
    // Redireciona para a nova rota de impressão
    navigate(`/prescriptions/print/${prescriptionId}`);
  };

  if (loading) {
    return (
      <div className="bg-background-DEFAULT p-6 rounded-xl shadow-custom-medium text-center">
        Carregando prescrições...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error p-6 rounded-xl shadow-custom-medium text-center text-white">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-background-DEFAULT p-6 rounded-xl shadow-custom-medium">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-dark">
          Prescrições de {patient ? patient.name : 'Paciente'}
        </h2>
        <button
          onClick={handleNew}
          className="bg-primary-dark text-white px-4 py-2 rounded-lg hover:bg-primary-light transition duration-200 flex items-center gap-2"
        >
          <FaPlus /> Nova Prescrição
        </button>
      </div>
      {prescriptions.length === 0 ? (
        <div className="text-center text-text-light">
          Nenhuma prescrição encontrada para este paciente.
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white p-4 rounded-lg shadow-sm border border-secondary-light">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-text-DEFAULT">{prescription.medication}</h3>
                  <p className="text-sm text-text-light">
                    Emitido: {moment(prescription.dateIssued).format('DD/MM/YYYY')}
                  </p>
                  <p className="text-sm text-text-light">
                    Status: <span className={`font-medium ${
                      prescription.status === 'active' ? 'text-success' :
                      prescription.status === 'expired' ? 'text-error' : 'text-text-light'
                    }`}>
                      {prescription.status}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(prescription.id)}
                    className="p-2 text-primary-dark hover:text-primary-light transition duration-200"
                    aria-label="Edit prescription"
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(prescription.id)}
                    className="p-2 text-error hover:text-red-700 transition duration-200"
                    aria-label="Delete prescription"
                    title="Excluir"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => handlePrint(prescription.id)}
                    className="p-2 text-secondary-dark hover:text-secondary-DEFAULT transition duration-200"
                    aria-label="Print prescription"
                    title="Imprimir"
                  >
                    <FaPrint />
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm text-text-DEFAULT">
                <p><strong>Dosagem:</strong> {prescription.dosage || 'N/A'}</p>
                <p><strong>Frequência:</strong> {prescription.frequency || 'N/A'}</p>
                <p><strong>Duração:</strong> {prescription.duration || 'N/A'}</p>
                {prescription.administrationInstructions && (
                  <p><strong>Instruções:</strong> {prescription.administrationInstructions}</p>
                )}
                {prescription.notes && (
                  <p><strong>Observações:</strong> {prescription.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        show={showConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        message="Tem certeza de que deseja excluir esta prescrição?"
      />
    </div>
  );
};

export default PrescriptionList;
