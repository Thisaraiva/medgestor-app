// Arquivo: C:\Programacao\Projetos\JavaScript\medgestor-app\frontend\src\components\RecordForm.js

import React, { useState, useEffect } from 'react';
import medicalRecordService from '../services/medicalRecordService';

const RecordForm = ({ patientId, recordId, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatment: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carrega os dados iniciais passados por prop
  useEffect(() => {
    if (initialData) {
      setFormData({
        diagnosis: initialData.diagnosis || '',
        treatment: initialData.treatment || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (recordId) {
        await medicalRecordService.updateRecord(recordId, formData);
      } else {
        const dataToSave = {
          ...formData,
          patientId,
          date: new Date().toISOString(),
        };
        await medicalRecordService.createRecord(dataToSave);
      }
      onSave();
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Erro ao salvar o prontuário. Por favor, verifique os dados.';
      setError(errorMessage);
      console.error('Erro ao salvar prontuário:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {recordId ? 'Editar Prontuário' : 'Novo Prontuário'}
      </h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
        <div className="mb-4">
          <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
            Diagnóstico <span className="text-red-500">*</span>
          </label>
          <textarea
            id="diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            required
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Resfriado comum..."
          />
        </div>
        <div className="mb-4">
          <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-1">
            Tratamento
          </label>
          <textarea
            id="treatment"
            name="treatment"
            value={formData.treatment}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Repouso, hidratação e analgésico..."
          />
        </div>
        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Notas adicionais sobre a consulta."
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Prontuário'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordForm;