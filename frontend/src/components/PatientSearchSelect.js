// frontend/src/components/PatientSearchSelect.js - VERSÃO ALTERNATIVA

import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import patientService from '../services/patientService';

const PatientSearchSelect = ({ value, onChange, disabled }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Carrega pacientes com filtro
  const loadPatients = useCallback(async (inputValue = '') => {
    setLoading(true);
    try {
      const filters = inputValue ? { name: inputValue } : {};
      const response = await patientService.getPatients(filters);
      const patients = response.data || response;
      
      // Ordena alfabeticamente
      const sorted = patients
        .map(p => ({ value: p.id, label: p.name }))
        .sort((a, b) => a.label.localeCompare(b.label));
      
      setOptions(sorted);
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega todos ao montar
  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Debounce na busca
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, loadPatients]);

  const handleInputChange = (newValue) => {
    setSearchTerm(newValue);
    return newValue;
  };

  const selectedOption = options.find(opt => opt.value === value) || null;

  // Estilos customizados para remover completamente o outline
  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : '#9ca3af'
      },
      boxShadow: 'none',
      outline: 'none',
      '&:focus-within': {
        boxShadow: '0 0 0 1px #3b82f6',
        borderColor: '#3b82f6'
      }
    }),
    input: (base) => ({
      ...base,
      '& input': {
        outline: 'none',
        boxShadow: 'none !important'
      }
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999
    })
  };

  return (
    <Select
      value={selectedOption}
      onChange={(opt) => onChange(opt ? opt.value : '')}
      onInputChange={handleInputChange}
      options={options}
      isLoading={loading}
      isDisabled={disabled}
      placeholder="Digite para buscar paciente..."
      noOptionsMessage={() => 'Nenhum paciente encontrado'}
      loadingMessage={() => 'Buscando...'}
      className="react-select-container"
      classNamePrefix="react-select"
      styles={customStyles}
    />
  );
};

export default PatientSearchSelect;