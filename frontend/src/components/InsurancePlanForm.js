// frontend/src/components/InsurancePlanForm.js

import React, { useState, useEffect } from 'react';
import insurancePlanService from '../services/insurancePlanService'; // Importa o serviço de planos de saúde

const InsurancePlanForm = ({ insurancePlan, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true); // Default para ativo
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Popula o formulário se um plano for passado para edição
  useEffect(() => {
    if (insurancePlan) {
      setName(insurancePlan.name || '');
      setDescription(insurancePlan.description || '');
      setIsActive(insurancePlan.isActive !== undefined ? insurancePlan.isActive : true);
    } else {
      // Limpa o formulário se nenhum plano for passado (modo de criação)
      setName('');
      setDescription('');
      setIsActive(true);
    }
    setMessage(''); // Limpa mensagens ao mudar de plano/modo
    setIsError(false);
  }, [insurancePlan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    const planData = {
      name,
      description,
      isActive,
    };

    try {
      if (insurancePlan) {
        // Modo de edição
        await insurancePlanService.updateInsurancePlan(insurancePlan.id, planData);
        setMessage('Insurance Plan updated successfully!');
        onSubmit('Insurance Plan updated successfully!', false);
      } else {
        // Modo de criação
        await insurancePlanService.createInsurancePlan(planData);
        setMessage('Insurance Plan created successfully!');
        onSubmit('Insurance Plan created successfully!', false);
        // Limpa o formulário após a criação
        setName('');
        setDescription('');
        setIsActive(true);
      }
      setIsError(false);
    } catch (err) {
      console.error('Error saving insurance plan:', err);
      const errorMessage = err.response?.data?.error?.message || 'Error saving insurance plan. Please try again.';
      setMessage(errorMessage);
      setIsError(true);
      onSubmit(errorMessage, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-DEFAULT p-6 rounded-xl shadow-custom-medium">
      <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">
        {insurancePlan ? 'Edit Insurance Plan' : 'New Insurance Plan'}
      </h2>

      {message && (
        <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isError ? 'bg-error text-white' : 'bg-success text-white'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200 bg-white"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-text-light text-sm font-semibold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light transition duration-200 bg-white"
            rows="3"
          ></textarea>
        </div>

        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="mr-2 h-4 w-4 text-primary-DEFAULT rounded border-gray-300 focus:ring-primary-light"
          />
          <label className="text-text-light text-sm font-semibold" htmlFor="isActive">
            Is Active
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-primary-dark text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
          disabled={loading}
        >
          {loading ? 'Saving...' : (insurancePlan ? 'Save Changes' : 'Create Insurance Plan')}
        </button>
      </form>
    </div>
  );
};

export default InsurancePlanForm;
