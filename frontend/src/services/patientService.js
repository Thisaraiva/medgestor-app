import axios from 'axios';

const API_URL = 'http://localhost:5000/api/patients';

const createPatient = async (patientData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(API_URL, patientData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

const getPatients = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export default { createPatient, getPatients };