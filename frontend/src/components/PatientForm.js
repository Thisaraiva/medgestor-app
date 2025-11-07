// frontend/src/components/PatientForm.js
import React, { useState, useEffect } from 'react';
import patientService from '../services/patientService';
import moment from 'moment';

const PatientForm = ({ patient, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [allergies, setAllergies] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      setName(patient.name || '');
      setCpf(patient.cpf || '');
      setDateOfBirth(patient.dateOfBirth ? moment(patient.dateOfBirth).format('YYYY-MM-DD') : '');
      setEmail(patient.email || '');
      setPhone(patient.phone || '');
      setAllergies(patient.allergies || '');
    } else {
      setName('');
      setCpf('');
      setDateOfBirth('');
      setEmail('');
      setPhone('');
      setAllergies('');
    }
    setMessage('');
    setIsError(false);
  }, [patient]);

  const formatCpf = (value) => {
    const numeric = value.replace(/\D/g, '');
    return numeric
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleCpfChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setCpf(formatCpf(raw));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    const patientData = {
      name,
      cpf,
      dateOfBirth: dateOfBirth || null,
      email: email || null,
      phone,
      allergies: allergies || null,
    };

    try {
      if (patient?.id) {
        const toUpdate = Object.fromEntries(
          Object.entries(patientData).filter(([, v]) => v !== null && v !== '')
        );
        await patientService.updatePatient(patient.id, toUpdate);
        setMessage('Paciente atualizado com sucesso!');
        onSubmit('Paciente atualizado com sucesso!', false);
      } else {
        await patientService.createPatient(patientData);
        setMessage('Paciente cadastrado com sucesso!');
        onSubmit('Paciente cadastrado com sucesso!', false);
        // Limpa formulário
        setName(''); setCpf(''); setDateOfBirth(''); setEmail(''); setPhone(''); setAllergies('');
      }
      setIsError(false);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao salvar paciente.';
      setMessage(errorMsg);
      setIsError(true);
      // NÃO CHAMA onSubmit com erro → mantém formulário aberto
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-primary-dark mb-6 text-center">
        {patient?.id ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}
      </h2>

      {message && (
        <div className={`p-4 mb-6 rounded-lg text-center font-medium ${isError ? 'bg-red-700 text-red-100 border border-red-300' : 'bg-green-700 text-green-100 border border-green-300'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-dark"
            placeholder="Nome do Paciente"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">CPF</label>
          <input
            type="text"
            value={cpf}
            onChange={handleCpfChange}
            maxLength="14"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-dark"
            placeholder="000.000.000-00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Nascimento (Opcional)</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-dark"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Opcional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-dark"
            placeholder="email@exemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-dark"
            placeholder="(XX) XXXXX-XXXX"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Alergias (Opcional)</label>
          <textarea
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-dark"
            rows="3"
            placeholder="Ex: Amoxicilina, Pólen"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-dark text-white py-3 rounded-lg font-bold hover:bg-primary-light hover:scale-105 transition transform"
          >
            {loading ? 'Salvando...' : (patient?.id ? 'Salvar' : 'Cadastrar')}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;