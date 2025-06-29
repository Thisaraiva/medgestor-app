// frontend/src/components/Modal.js

import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Componente de Modal genérico.
 *
 * @param {object} props - Propriedades do componente.
 * @param {boolean} props.show - Controla a visibilidade do modal.
 * @param {function} props.onClose - Função chamada ao fechar o modal.
 * @param {React.ReactNode} props.children - Conteúdo a ser exibido dentro do modal.
 */
const Modal = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background-DEFAULT rounded-xl shadow-2xl w-full max-w-lg relative transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-light hover:text-primary-dark text-2xl font-bold"
          aria-label="Fechar"
        >
          &times;
        </button>
        <div className="p-8">
          {children} {/* O conteúdo do modal é renderizado aqui */}
        </div>
      </div>
    </div>,
    document.body // Renderiza o modal diretamente no body para evitar problemas de z-index
  );
};

export default Modal;
