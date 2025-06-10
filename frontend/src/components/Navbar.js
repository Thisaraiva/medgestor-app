import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-blue-500 p-4">
            <div className="container mx-auto flex justify-between">
                <Link to="/" className="text-white text-xl font-bold">MedGestor</Link>
                <div>
                    <Link to="/dashboard" className="text-white mr-4">Dashboard</Link>
                    <button className="text-white">Sair</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;