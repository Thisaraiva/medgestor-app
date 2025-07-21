// frontend/src/pages/InsurancePlanList.js

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import insurancePlanService from '../services/insurancePlanService';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';

const InsurancePlanList = () => {
  const [insurancePlans, setInsurancePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [isActionError, setIsActionError] = useState(false);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Função para buscar todos os planos de saúde
  const fetchInsurancePlans = async () => {
    setLoading(true);
    setError(null);
    try {
      // O backend retorna apenas planos ativos por padrão, o que é bom para a listagem geral.
      const response = await insurancePlanService.getAllInsurancePlans();
      setInsurancePlans(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching insurance plans:', err);
      setError(err.response?.data?.error?.message || 'Error loading insurance plans. Check your permissions or try again.');
      setInsurancePlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apenas 'admin' e 'secretary' podem acessar esta página para gerenciar planos.
    if (currentUser?.role && ['admin', 'secretary'].includes(currentUser.role)) {
      fetchInsurancePlans();
    } else {
      setError('You do not have permission to access this page.');
      setLoading(false);
    }

    // Lida com mensagens passadas via state de navegação
    if (location.state && location.state.message) {
      setActionMessage(location.state.message);
      setIsActionError(location.state.isError || false);
      navigate(location.pathname, { replace: true, state: {} }); // Limpa a mensagem do state
      setTimeout(() => setActionMessage(''), 3000);
    }
  }, [currentUser, location.state, navigate]);

  const handleAddPlan = () => {
    navigate('/insurance-plans/new');
  };

  const handleEditPlan = (planId) => {
    navigate(`/insurance-plans/edit/${planId}`);
  };

  const confirmDeletePlan = (planId) => {
    setPlanToDelete(planId);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirmed = async () => {
    setShowConfirmDialog(false);
    if (planToDelete) {
      try {
        await insurancePlanService.deleteInsurancePlan(planToDelete);
        setActionMessage('Insurance Plan deleted successfully!');
        setIsActionError(false);
        fetchInsurancePlans(); // Recarrega a lista
      } catch (err) {
        console.error('Error deleting insurance plan:', err);
        const errorMessage = err.response?.data?.error?.message || 'Error deleting insurance plan. Check your permissions.';
        setActionMessage(errorMessage);
        setIsActionError(true);
      } finally {
        setPlanToDelete(null);
        setTimeout(() => setActionMessage(''), 3000);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light font-sans flex items-center justify-center">
        <p className="text-text-DEFAULT text-lg">Loading insurance plans...</p>
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
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary-dark">Insurance Plan Management</h1>
          {currentUser?.role && ['admin', 'secretary'].includes(currentUser.role) && (
            <button
              onClick={handleAddPlan}
              className="bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-DEFAULT transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            >
              New Plan
            </button>
          )}
        </div>

        {actionMessage && (
          <div className={`p-3 mb-4 rounded-lg text-sm text-center ${isActionError ? 'bg-error text-white' : 'bg-success text-white'}`}>
            {actionMessage}
          </div>
        )}

        {insurancePlans.length === 0 ? (
          <p className="text-center text-text-light text-lg mt-10">No insurance plans registered yet.</p>
        ) : (
          <div className="overflow-x-auto bg-background-DEFAULT rounded-xl shadow-custom-medium">
            <table className="min-w-full divide-y divide-secondary-dark">
              <thead className="bg-secondary-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-dark">
                {insurancePlans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-DEFAULT">
                      {plan.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {plan.description || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                      {plan.isActive ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditPlan(plan.id)}
                        className="text-primary-DEFAULT hover:text-primary-dark mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDeletePlan(plan.id)}
                        className="text-error hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmDialog
        show={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteConfirmed}
        message="Are you sure you want to delete this insurance plan?"
      />
    </div>
  );
};

export default InsurancePlanList;
