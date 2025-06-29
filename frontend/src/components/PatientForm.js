// frontend/src/components/PatientForm.js

import React, { useState, useEffect } from 'react';
import patientService from '../services/patientService'; // Importa o serviço de paciente

/**
 * Componente de formulário para adicionar ou editar pacientes.
 *
 * @param {object} props - Propriedades do componente.
 * @param {object} [props.patient] - Objeto paciente para edição. Se nulo, é um formulário de adição.
 * @param {function} props.onSubmit - Função a ser chamada após a submissão bem-sucedida.
 */
const PatientForm = ({ patient, onSubmit }) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
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
      setPhone(patient.phone || '');
      setAllergies(patient.allergies || '');
    } else {
      // Limpa o formulário se não houver paciente para edição
      setName('');
      setCpf('');
      setPhone('');
      setAllergies('');
    }
    setMessage(''); // Limpa mensagens ao mudar de paciente/modo
    setIsError(false);
  }, [patient]);

  /**
   * Formata o CPF para o padrão 000.000.000-00
   * @param {string} value - O valor do CPF sem formatação.
   * @returns {string} - O CPF formatado.
   */
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

    // Remove a formatação do CPF antes de enviar para o backend,
    // pois o backend espera apenas dígitos, a validação Joi pode ser ajustada.
    // Ou, se o Joi espera o formato com pontos e traço, garantimos que o formato seja enviado.
    // Pelo erro, o Joi espera o formato com pontos e traço.
    const unformattedCpf = cpf.replace(/\D/g, ''); // Remove pontos e traços para enviar ao backend se o backend espera só números
    const patientData = { name, cpf, phone, allergies }; // Envia o CPF formatado se o Joi espera assim

    try {
      if (patient) {
        await patientService.updatePatient(patient.id, patientData); // Chama o serviço de atualização
        setMessage('Paciente atualizado com sucesso!');
      } else {
        await patientService.createPatient(patientData); // Chama o serviço de criação
        setMessage('Paciente cadastrado com sucesso!');
        // Limpa o formulário após o cadastro
        setName('');
        setCpf('');
        setPhone('');
        setAllergies('');
      }
      setIsError(false);
      onSubmit(); // Chama a função onSubmit passada pelas props para notificar o pai
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Erro ao salvar paciente. Tente novamente.';
      setMessage(errorMessage);
      setIsError(true);
      console.error('Erro ao salvar paciente:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-DEFAULT p-6 rounded-xl">
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
          className="w-full bg-primary-DEFAULT text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
          disabled={loading}
        >
          {loading ? 'Salvando...' : (patient ? 'Salvar Alterações' : 'Cadastrar Paciente')}
        </button>
      </form>
    </div>
  );
};

export default PatientForm;
