// frontend/src/pages/InsurancePlanFormPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import InsurancePlanForm from '../components/InsurancePlanForm'; // Importa o novo formulário
import insurancePlanService from '../services/insurancePlanService'; // Importa o serviço

const InsurancePlanFormPage = () => {
  const { id } = useParams(); // Obtém o ID do plano da URL (se estiver em modo de edição)
  const navigate = useNavigate();
  const location = useLocation();
  const [insurancePlan, setInsurancePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsurancePlan = async () => {
      if (id) { // Se houver um ID na URL, estamos em modo de edição
        try {
          const fetchedPlan = await insurancePlanService.getInsurancePlanById(id);
          setInsurancePlan(fetchedPlan.data); // Axios retorna os dados em .data
        } catch (err) {
          console.error('Error fetching insurance plan for editing:', err);
          setError('Error loading insurance plan data for editing.');
        } finally {
          setLoading(false);
        }
      } else { // Se não houver ID, estamos em modo de adição
        setLoading(false);
      }
    };
    fetchInsurancePlan();

    // Lida com mensagens passadas via state de navegação (se vier de outra página)
    if (location.state && location.state.message) {
      // A mensagem será passada para a lista após a submissão
      navigate(location.pathname, { replace: true, state: {} }); // Limpa a mensagem do state
    }
  }, [id, location.state, navigate]);

  const handleFormSubmit = (message, isError) => {
    // Após a submissão do formulário, exibe a mensagem e redireciona para a lista de planos
    console.log('Formulário de plano de saúde submetido:', message, 'Erro:', isError);
    setTimeout(() => {
      navigate('/insurance-plans', { state: { message, isError } }); // Passa a mensagem via state
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light font-sans flex items-center justify-center">
        <p className="text-text-DEFAULT text-lg">Carregando formulário do plano de saúde...</p>
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
        <div className="w-full max-w-md"> {/* Largura ajustada para formulário */}
          <InsurancePlanForm insurancePlan={insurancePlan} onSubmit={handleFormSubmit} />
        </div>
      </div>
    </div>
  );
};

export default InsurancePlanFormPage;
