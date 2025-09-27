// frontend/src/components/PatientForm.js

import React, { useState, useEffect } from 'react';
import patientService from '../services/patientService'; // Importa o serviço de paciente
import moment from 'moment'; // Importa a biblioteca moment

const PatientForm = ({ patient, onSubmit }) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  // NOVO ESTADO: Data de Nascimento
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState(''); 
  const [phone, setPhone] = useState('');
  const [allergies, setAllergies] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Preenche o formulário se um paciente for passado para edição
  useEffect(() => {
    if (patient) {
      setName(patient.name || '');
      setCpf(patient.cpf || '');
      // TRATAMENTO DA DATA DE NASCIMENTO: Formata para 'YYYY-MM-DD' para o input type="date"
      // Se houver data, usa moment para garantir o formato correto para o input HTML
      const formattedDate = patient.dateOfBirth ? moment(patient.dateOfBirth).format('YYYY-MM-DD') : '';
      setDateOfBirth(formattedDate);
      setEmail(patient.email || ''); 
      setPhone(patient.phone || '');
      setAllergies(patient.allergies || '');
    } else {
      // Limpa o formulário se não houver paciente para edição
      setName('');
      setCpf('');
      setDateOfBirth(''); // Limpa a data de nascimento
      setEmail(''); 
      setPhone('');
      setAllergies('');
    }
    setMessage(''); // Limpa mensagens ao mudar de paciente/modo
    setIsError(false);
  }, [patient]);

  
  const formatCpf = (value) => {
    // Remove tudo que não for dígito
    const numericValue = value.replace(/\D/g, '');
    // Aplica a máscara
    return numericValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleCpfChange = (e) => {
    const rawCpf = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    setCpf(formatCpf(rawCpf));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    // Envia a string de data (YYYY-MM-DD) para o backend, ou null se vazia
    // O backend fará a validação de data
    const finalDateOfBirth = dateOfBirth || null;
    
    // Inclui dateOfBirth nos dados do paciente
    const patientData = { 
        name, 
        cpf, 
        dateOfBirth: finalDateOfBirth, // NOVO CAMPO INCLUÍDO
        email, 
        phone, 
        allergies 
    };


    try {
      if (patient) {
        // Remove campos vazios ou nulos para atualização (boa prática)
        const dataToUpdate = Object.fromEntries(
            Object.entries(patientData).filter(([, value]) => value !== null && value !== '')
        );

        await patientService.updatePatient(patient.id, dataToUpdate); // Chama o serviço de atualização
        setMessage('Paciente atualizado com sucesso!');
        onSubmit('Paciente atualizado com sucesso!', false); // Passa mensagem e status para o pai
      } else {
        await patientService.createPatient(patientData); // Chama o serviço de criação
        setMessage('Paciente cadastrado com sucesso!');
        onSubmit('Paciente cadastrado com sucesso!', false); // Passa mensagem e status para o pai
        // Limpa o formulário após o cadastro
        setName('');
        setCpf('');
        setDateOfBirth(''); // Limpa a data de nascimento
        setEmail(''); 
        setPhone('');
        setAllergies('');
      }
      setIsError(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Erro ao salvar paciente. Tente novamente.';
      setMessage(errorMessage);
      setIsError(true);
      onSubmit(errorMessage, true); // Passa mensagem de erro e status para o pai
      console.error('Erro ao salvar paciente:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-DEFAULT p-6 rounded-xl shadow-custom-medium"> {/* Adicionado shadow aqui */}
      <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
        {patient ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}
      </h2>

      {message && (
        <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isError ? 'bg-error text-white' : 'bg-success text-white'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="patientName">
            Nome Completo
          </label>
          <input
            type="text"
            id="patientName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
            placeholder="Nome do Paciente"
            required
            autoComplete="name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="patientCpf">
            CPF
          </label>
          <input
            type="text"
            id="patientCpf"
            value={cpf}
            onChange={handleCpfChange} // Usa a nova função para formatar o CPF
            maxLength="14" // Limita a entrada para o formato XXX.XXX.XXX-XX
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
            placeholder="000.000.000-00"
            required
            autoComplete="off"
          />
        </div>

        {/* NOVO CAMPO: Data de Nascimento (após CPF) */}
        <div className="mb-4">
            <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="patientDateOfBirth">
                Data de Nascimento (Opcional)
            </label>
            <input
                type="date"
                id="patientDateOfBirth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
                placeholder="AAAA-MM-DD"
                autoComplete="bday"
            />
        </div>

        {/* Campo de Email */}
        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="patientEmail">
            Email (Opcional)
          </label>
          <input
            type="email"
            id="patientEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
            placeholder="email@exemplo.com"
            autoComplete="email"
          />
        </div>

        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="patientPhone">
            Telefone
          </label>
          <input
            type="tel"
            id="patientPhone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
            placeholder="(XX) XXXXX-XXXX"
            required
            autoComplete="tel"
          />
        </div>

        <div className="mb-6">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="patientAllergies">
            Alergias (Opcional)
          </label>
          <textarea
            id="patientAllergies"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200"
            placeholder="Ex: Amoxicilina, Pólen"
            rows="3"
            autoComplete="off"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-primary-dark text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
          disabled={loading}
        >
          {loading ? 'Salvando...' : (patient ? 'Salvar Alterações' : 'Cadastrar Paciente')}
        </button>
      </form>
    </div>
  );
};

export default PatientForm;