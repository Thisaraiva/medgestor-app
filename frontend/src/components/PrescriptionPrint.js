// C:\Programacao\Projetos\JavaScript\medgestor-app\frontend\src\components\PrescriptionPrint.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import prescriptionService from '../services/prescriptionService';
import patientService from '../services/patientService';
import userService from '../services/userService';
import moment from 'moment';

const PrescriptionPrint = () => {
    const { prescriptionId } = useParams();
    const navigate = useNavigate();
    const [prescription, setPrescription] = useState(null);
    const [patient, setPatient] = useState(null);
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrescriptionData = async () => {
            if (!prescriptionId) {
                setError('ID da prescrição não fornecido.');
                setLoading(false);
                return;
            }

            try {
                // Busca a prescrição
                const fetchedPrescription = await prescriptionService.getPrescriptionById(prescriptionId);
                setPrescription(fetchedPrescription);

                // Busca o paciente e o médico em paralelo para melhor performance
                const [fetchedPatient, fetchedDoctor] = await Promise.all([
                    patientService.getPatientById(fetchedPrescription.patientId),
                    userService.getUserById(fetchedPrescription.doctorId)
                ]);

                setPatient(fetchedPatient);
                setDoctor(fetchedDoctor);

                setLoading(false);

            } catch (err) {
                console.error('Erro ao buscar dados para impressão:', err);
                const errorMessage = err.response?.data?.error || 'Erro ao carregar os dados para impressão. Tente novamente.';
                setError(errorMessage);
                setLoading(false);
            }
        };

        fetchPrescriptionData();
    }, [prescriptionId]);
    
    // Função para voltar para a página de prescrições do paciente
    const handleGoBack = () => {
        if (patient && patient.id) {
            navigate(`/patients/${patient.id}/prescriptions`);
        } else {
            // Em caso de falha, tenta voltar para a página anterior do histórico
            navigate(-1);
        }
    };
    
    // Usa uma classe CSS para elementos que não devem ser impressos
    // e o botão de voltar para a página de prescrições
    const printStyles = `
        @page {
            size: A4;
            margin: 20mm;
        }
        body {
            font-family: Arial, sans-serif;
            color: #333;
        }
        .print-container {
            width: 100%;
            max-width: 800px;
            margin: auto;
            border: 1px solid #ddd;
            padding: 20px;
        }
        .header, .footer {
            text-align: center;
            margin-bottom: 20px;
        }
        .section-title {
            font-size: 1.25rem;
            font-weight: bold;
            border-bottom: 2px solid #ccc;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .info-item {
            margin-bottom: 8px;
        }
        .medication-details {
            border: 1px solid #eee;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        @media print {
            .no-print {
                display: none;
            }
        }
    `;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-center text-primary-dark">Carregando dados da prescrição...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-white bg-error rounded-lg shadow-md">
                {error}
            </div>
        );
    }

    if (!prescription || !patient || !doctor) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-center text-text-light">Dados incompletos para impressão.</div>
            </div>
        );
    }
    
    // Usa a mesma classe para o botão de voltar e para o botão de impressão.
    // Isso é mais conciso e evita a repetição de código.
    const buttonClass = "bg-primary-dark text-white px-4 py-2 rounded-lg hover:bg-primary-light transition duration-200 flex items-center gap-2";

    return (
        <>
            <style>{printStyles}</style>
            <div className="no-print flex justify-end gap-4 p-4">
                <button
                    onClick={handleGoBack}
                    className={buttonClass}
                >
                    Voltar para Prescrições
                </button>
                <button
                    onClick={() => window.print()}
                    className={buttonClass}
                >
                    Imprimir Receita
                </button>
            </div>
            
            <div className="print-container p-8 mx-auto my-8 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="header text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary-dark">Receita Médica</h1>
                    <p className="text-lg text-secondary-dark">{doctor.name}, {doctor.role}</p>
                    <p className="text-sm text-text-light">CRM: {doctor.crm}</p>
                </div>

                <div className="mb-6">
                    <p className="font-semibold">Paciente:</p>
                    <p className="pl-4">{patient.name}</p>
                    <p className="pl-4">Data de Nascimento: {moment(patient.dateOfBirth).format('DD/MM/YYYY')}</p>
                    <p className="pl-4">CPF: {patient.cpf}</p>
                </div>

                <hr className="my-6 border-gray-300" />

                <h2 className="section-title text-xl font-bold border-b-2 border-primary-dark pb-2 mb-4">Prescrição</h2>

                <div className="medication-details p-4 bg-gray-100 rounded-md">
                    <h3 className="text-lg font-semibold">{prescription.medication}</h3>
                    <p className="text-sm text-text-DEFAULT mt-1">
                        Dosagem: {prescription.dosage || 'N/A'}
                    </p>
                    <p className="text-sm text-text-DEFAULT">
                        Frequência: {prescription.frequency || 'N/A'}
                    </p>
                    <p className="text-sm text-text-DEFAULT">
                        Duração: {prescription.duration || 'N/A'}
                    </p>
                    <p className="text-sm text-text-DEFAULT mt-2">
                        Instruções de Administração:
                        <br />
                        {prescription.administrationInstructions || 'Não especificado.'}
                    </p>
                    {prescription.notes && (
                        <p className="text-sm text-text-DEFAULT mt-2">
                            Observações:
                            <br />
                            {prescription.notes}
                        </p>
                    )}
                </div>

                <div className="flex justify-between items-center mt-8 text-sm text-text-light">
                    <p>Data de Emissão: {moment(prescription.dateIssued).format('DD/MM/YYYY')}</p>
                    <p>Status: {prescription.status}</p>
                </div>
            </div>
        </>
    );
};

export default PrescriptionPrint;