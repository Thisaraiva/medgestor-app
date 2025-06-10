 ## Visão Geral
 O MedGestor é um aplicativo web para gestão de consultórios médicos, com funcionalidades de agendamento, gerenciamento de pacientes, prontuários e receitas.

 ## Como Executar
 1. Clone o repositório: `git clone <repo-url>`
 2. Configure o backend:
    - Instale dependências: `cd backend && npm install`
    - Configure `.env` com as credenciais do PostgreSQL
    - Execute: `npm start`
 3. Configure o frontend:
    - Instale dependências: `cd frontend && npm install`
    - Execute: `npm start`

 ## Estrutura do Projeto
 - `backend/`: Contém o servidor Node.js, modelos Sequelize, rotas e controladores.
 - `frontend/`: Contém o aplicativo React com Tailwind CSS.
 - `database/`: Contém migrações e schema SQL.