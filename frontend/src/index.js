// frontend/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client'; // Importa o cliente de renderização do ReactDOM
import App from './App'; // Importa o componente principal da sua aplicação
import './styles/tailwind.css'; // Importa o arquivo CSS do Tailwind para que ele seja processado e incluído

// Cria um root do React para a sua aplicação.
// O 'root' é o ponto de entrada onde o React irá montar e gerenciar sua árvore de componentes.
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderiza o componente principal 'App' dentro do 'root'.
// <React.StrictMode> é um componente que ajuda a identificar problemas potenciais em uma aplicação.
// Ele ativa verificações e avisos adicionais para seus descendentes.
root.render(
  <React.StrictMode>
    <App /> {/* O componente principal da sua aplicação */}
  </React.StrictMode>
);
