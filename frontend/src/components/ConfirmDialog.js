// frontend/src/components/ConfirmDialog.js

import React from 'react';
import Modal from './Modal'; // Reutiliza o componente Modal

const ConfirmDialog = ({ show, onClose, onConfirm, message }) => {
  return (
    <Modal show={show} onClose={onClose}>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-text-DEFAULT mb-4">Confirmação</h3>
        <p className="text-text-light mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-error text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition duration-200"
          >
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
