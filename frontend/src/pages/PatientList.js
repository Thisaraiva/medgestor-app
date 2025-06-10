import React, { useState, useEffect } from 'react';
import patientService from '../services/patientService';
import Navbar from '../components/Navbar';

const PatientList = () => {
    const [patients, setPatients] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await patientService.getPatients();
                setPatients(data);
            } catch (err) {
                setError('Erro ao carregar pacientes');
            }
        };
        fetchPatients();
    }, []);

    return (
        <div>
            <Navbar />
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">Lista de Pacientes</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <ul>
                    {patients.map((patient) => (
                        <li key={patient.id} className="p-2 border-b">
                            {patient.name} - CPF: {patient.cpf}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PatientList;