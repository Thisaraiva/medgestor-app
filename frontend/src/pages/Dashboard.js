import React from 'react';
import Navbar from '../components/Navbar';

const Dashboard = () => {
    return (
        <div>
            <Navbar />
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold">Bem-vindo ao MedGestor</h1>
                <p>Dashboard em construção...</p>
            </div>
        </div>
    );
};

export default Dashboard;