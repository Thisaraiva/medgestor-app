// frontend/src/pages/RecordViewPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import medicalRecordService from '../services/medicalRecordService';
import patientService from '../services/patientService';
import { useAuth } from '../context/AuthContext';
import { /*FaPlus,*/ FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import ConfirmDialog from '../components/ConfirmDialog';

const RecordViewPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const canManageRecords = user && (user.role === 'admin' || user.role === 'doctor');

  const fetchRecordsAndPatient = async () => {
    setLoading(true);
    setError(null);
    try {
      const patientData = await patientService.getPatientById(patientId);
      setPatient(patientData);

      const recordsData = await medicalRecordService.getRecordsByPatient(patientId);
      setRecords(recordsData);
    } catch (err) {
      console.error('Erro ao buscar prontuários:', err);
      setError('Erro ao carregar os prontuários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordsAndPatient();
  }, [patientId]);

  const handleDeleteRecord = async () => {
    setShowConfirmDialog(false);
    if (recordToDelete) {
      try {
        await medicalRecordService.deleteRecord(recordToDelete);
        setRecords(records.filter(record => record.id !== recordToDelete));
      } catch (err) {
        console.error('Erro ao excluir prontuário:', err);
        setError('Erro ao excluir o prontuário. Tente novamente.');
      } finally {
        setRecordToDelete(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light">
        <Navbar />
        <div className="container mx-auto text-center mt-20">Carregando prontuários...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light">
        <Navbar />
        <div className="container mx-auto text-center mt-20 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light font-sans">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary-dark">
            Prontuários de {patient?.name || 'Paciente'}
          </h1>
          {canManageRecords && (
            <button
              onClick={() => navigate(`/patients/${patientId}/medical-records/new`)}
              className="bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-DEFAULT transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            >              
              Novo Prontuário
            </button>
          )}
        </div>

        {records.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">Nenhum prontuário encontrado para este paciente.</p>
        ) : (
          <div className="space-y-4">
            {records.map(record => (
              <div key={record.id} className="bg-white p-6 rounded-lg shadow-custom-light border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* A data já vem formatada do backend, não precisa de toLocaleDateString */}
                    <h3 className="text-xl font-semibold text-text-DEFAULT mb-2">
                      {record.date}
                    </h3>
                    <p className="text-sm text-text-muted italic mb-2">Diagnóstico: {record.diagnosis}</p>
                    <p className="text-sm text-text-light mb-1">Tratamento: {record.treatment || 'Não especificado'}</p>
                    <p className="text-sm text-text-light">Notas: {record.notes || 'Nenhuma'}</p>
                  </div>
                  {canManageRecords && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => navigate(`/patients/${patientId}/medical-records/edit/${record.id}`)}
                        className="text-primary-DEFAULT hover:text-primary-dark"
                        title="Editar Prontuário"
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        onClick={() => {
                          setRecordToDelete(record.id);
                          setShowConfirmDialog(true);
                        }}
                        className="text-error hover:text-red-700"
                        title="Excluir Prontuário"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        show={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteRecord}
        message="Tem certeza que deseja excluir este prontuário?"
      />
    </div>
  );
};

export default RecordViewPage;