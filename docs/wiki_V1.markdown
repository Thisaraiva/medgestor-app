# MedGestor — Documentação Oficial  
**Sistema Web para Gestão Completa de Clínicas e Consultórios Médicos**  
**Projeto Final – Engenharia de Software – Católica de Santa Catarina**  

[![LIVE](https://img.shields.io/badge/Produção-LIVE-brightgreen)](https://medgestor-frontend-node.onrender.com)
[![API](https://img.shields.io/badge/API-Ativa-blue)](https://medgestor-backend.onrender.com/api)
[![PostgreSQL](https://img.shields.io/badge/DB-PostgreSQL_17-6d5acf)](https://render.com)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions_%2B_Render_Webhooks-success)](https://github.com/Thisaraiva/medgestor-app/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Links Importantes (Tudo em Produção Real)

```
| Item                            | URL                                                                      |
|---------------------------------|--------------------------------------------------------------------------|
| Aplicação em Produção           | https://medgestor-frontend-node.onrender.com                            |
| API Backend                     | https://medgestor-backend.onrender.com/api                               |
| Repositório GitHub              | https://github.com/Thisaraiva/medgestor-app                              |
| Banco de Dados (Render)         | `dpg-d47uk43ipnbc73d57950-a` (Oregon US-West)                           |
| Dashboard Render – Frontend     | https://dashboard.render.com/web/srv-d4drjfbe5dus73fb9da0              |
| Dashboard Render – Backend      | https://dashboard.render.com/web/srv-d47vjn7diees739l09n0              |
```

---

## Visão Geral do Projeto

**MedGestor** é um sistema web completo desenvolvido como trabalho final da disciplina **Projeto Portfólio (RFC)** da graduação em **Engenharia de Software** na Católica de Santa Catarina.

O sistema **atende 100% dos requisitos obrigatórios e quase todos os diferenciais** exigidos para o **Poster + Demo Day 2025**, incluindo:

- Hospedagem pública acessível (Render.com Free Tier)  
- 3+ fluxos de negócio completos  
- Autenticação JWT robusta  
- Dashboard com estatísticas  
- Interface responsiva  
- CI/CD automático com GitHub Actions + Render Deploy Hooks  
- Testes automatizados (Jest + Supertest)  
- Dockerização completa  

---

## Funcionalidades Entregues (Todas em Produção)

```
| Funcionalidade                          | Status      | Perfil responsável           |
|-----------------------------------------|-------------|------------------------------|
| Login / Registro com JWT                | Concluído   | Todos                        |
| Controle de Acesso por Perfil (Admin, Médico, Secretária) | Concluído | Todos        |
| Cadastro e Gerenciamento de Usuários    | Concluído   | Admin / Secretária           |
| Cadastro de Pacientes                   | Concluído   | Secretária / Médico          |
| Agendamento de Consultas (Inicial/Retorno) | Concluído | Secretária                  |
| Prontuários Eletrônicos                 | Concluído   | Médico                       |
| Emissão de Receitas Médicas             | Concluído   | Médico                       |
| Interface 100% Responsiva               | Concluído   | Todos                        |
```

---

## Stack Tecnológica (2025)

```
| Camada           | Tecnologia                                   | Versão      |
|------------------|----------------------------------------------|-------------|
| Frontend         | React 18 + React Router + Tailwind CSS       | 18.x        |
| Build Frontend   | Webpack 5 + Nginx (produção)                 | 5.x         |
| Backend          | Node.js + Express.js                         | 20.14.0     |
| ORM              | Sequelize                                    | 6.x         |
| Banco de Dados   | PostgreSQL 17 (Render.com externo)           | 17          |
| Autenticação     | JWT + bcryptjs                               | —           |
| Validação        | Joi                                          | 17.x        |
| Testes           | Jest + Supertest                             | 29.x        |
| Containerização  | Docker + Docker Compose (dev)                | 24.x / 2.x  |
| Deploy           | Render.com (2 serviços + DB)                 | Free Tier   |
| CI/CD            | GitHub Actions + GitHub Whebhooks +          | —           |
|                  | Render Deploy Webhooks                       | —           |
```

---

## Arquitetura C4 – Container Diagram (Produção)

```mermaid
graph TD
    U[Usuário] -->|HTTPS| F[Frontend React<br/>Nginx - Render]
    F -->|REST API| B[Backend Node.js<br/>Express - Render]
    B -->|Sequelize ORM| DB[(PostgreSQL<br/>Render Database)]
    B -->|JWT| Auth[Autenticação Stateless]
    
    subgraph "Render.com (Oregon US-West)"
        F & B & DB
    end
    
    G[GitHub] -->|Push main| GH[GitHub Actions]
    GH -->|Deploy Hook| RENDER[Render Auto-Deploy]
```
---

# Documentação do Projeto MedGestor

## Visão Geral
O MedGestor é uma aplicação web abrangente projetada para otimizar o gerenciamento de clínicas médicas. Ele facilita o cadastro e a administração de usuários (administradores, médicos e secretárias), pacientes, agendamentos de consultas, prontuários médicos detalhados e prescrições. A arquitetura do projeto é modular, compreendendo um banco de dados relacional (PostgreSQL), um backend robusto (Node.js com Express e Sequelize), e um frontend interativo (React). A utilização do Docker para orquestração dos serviços garante um ambiente de desenvolvimento e produção consistente, portátil e escalável.

## Objetivo
O principal objetivo do MedGestor é automatizar e simplificar os processos operacionais diários em clínicas médicas, como agendamento de consultas, gerenciamento de prontuários eletrônicos e emissão de prescrições, proporcionando uma interface de usuário intuitiva e segura para todos os perfis de usuários.

## Tecnologias Utilizadas
- **Banco de Dados**: PostgreSQL 17
- **Backend**: Node.js 20.14.0, Express.js (framework web), Sequelize ORM (Object-Relational Mapper)
- **Frontend**: React (biblioteca JavaScript para UI), Webpack (empacotador de módulos)
- **Orquestração**: Docker, Docker Compose
- **Autenticação e Segurança**: JSON Web Tokens (JWT), bcryptjs (hash de senhas)
- **Validação de Dados**: Joi
- **Testes**: Jest (para testes unitários e de integração), Supertest (para testes de API)
- **Geração de IDs**: uuid
- **Ferramentas de Banco de Dados**: Sequelize CLI (para migrações e seeds)

## Estrutura do Projeto
O repositório do MedGestor está organizado de forma lógica para facilitar o desenvolvimento, a manutenção e o entendimento da arquitetura.

```
medgestor-app/
├── .github/
│   └── workflows/
│       └── ci-cd.yml                       # GitHub Actions + Render Deploy Hooks
├── backend/                                # API Node.js/Express
│   ├── config/
│   │   ├── config.js
│   │   └── database.js
│   ├── controllers/                        # Camada de controle
│   │   ├── appointmentController.js
│   │   ├── authController.js
│   │   ├── insurancePlanController.js
│   │   ├── patientController.js
│   │   ├── prescriptionController.js
│   │   ├── recordController.js
│   │   └── userController.js
│   ├── errors/
│   │   └── errors.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── controllerMiddleware.js         # async handler
│   │   └── errorMiddleware.js
│   ├── migrations/                         # Sequelize
│   │   ├── 2025061001_create_users.js
│   │   ├── 2025061002_create_patients.js
│   │   ├── 2025061003_create_insurance_plans.js
│   │   ├── 2025061004_create_appointments.js
│   │   ├── 2025061005_create_medical_records.js
│   │   └── 2025061006_create_prescriptions.js
│   ├── models/
│   │   ├── Appointment.js
│   │   ├── InsurancePlan.js
│   │   ├── MedicalRecord.js
│   │   ├── Patient.js
│   │   ├── Prescription.js
│   │   ├── User.js
│   │   └── index.js
│   ├── routes/
│   │   ├── appointmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── insurancePlanRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── prescriptionRoutes.js
│   │   ├── recordRoutes.js
│   │   └── userRoutes.js
│   ├── seeders/
│   │   ├── 01_seed_users.js
│   │   ├── 02_seed_patient.js
│   │   ├── 03_seed_insurance_plans.js
│   │   ├── 04_seed_appointments.js
│   │   ├── 05_seed_prescriptions.js
│   │   ├── 06_seed_medical_records.js
│   │   └── 99_seed_admin_production.js     # Admin real em produção
│   ├── services/                           # Regras de negócio
│   │   ├── appointmentService.js
│   │   ├── authService.js
│   │   ├── insurancePlanService.js
│   │   ├── patientService.js
│   │   ├── prescriptionService.js
│   │   ├── recordService.js
│   │   └── userService.js
│   ├── tests/
│   │   ├── integration/                    # Supertest
│   │   └── unit/                           # Jest puro
│   ├── utils/
│   │   ├── email.js
│   │   └── jwt.js
│   ├── coverage/                           # Relatórios de cobertura
│   ├── .env.example
│   ├── .env.test
│   ├── package.json
│   └── server.js                           # Entry point
├── frontend/                               # React 18 + Tailwind
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/                     # Reutilizáveis
│   │   ├── context/                        # AuthContext
│   │   ├── pages/                          # Todas as telas
│   │   ├── services/                       # Chamadas à API
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── build/                              # Output do webpack
│   ├── nginx.conf                          # Servidor estático em produção
│   ├── webpack.config.js
│   ├── tailwind.config.js
│   └── package.json
├── database/
│   └── schema.sql                          # SQL puro (referência)
├── docs/
│   ├── diagrams/
│   │   └── use_case.puml
│   └── WIKI_HOME.md                        # Esta documentação
├── infra/
│   └── terraform/
│       └── main.tf                         # IaC (futuro AWS/GCP)
├── .gitignore
├── docker-compose.yml                      # Dev local (db + db_test + backend + frontend)
├── Dockerfile.backend                      # Multi-stage Node.js
├── Dockerfile.frontend                     # Multi-stage React + Nginx
├── README.md
└── package-lock.json (raiz opcional)       # Visão geral e instruções básicas do projeto
```

## Arquitetura do Sistema
O MedGestor adota uma arquitetura de microsserviços simplificada, com três componentes principais desacoplados, comunicando-se via APIs RESTful.

### Diagrama de Alto Nível
```mermaid
graph TD
    User[Usuário] -->|Acessa| Frontend[Frontend React]
    Frontend -->|Requisições HTTP/API REST| Backend[Backend Node.js/Express]
    Backend -->|Consultas SQL/ORM| Database[Banco de Dados PostgreSQL]

    subgraph Docker Containers
        Frontend
        Backend
        Database
    end

    subgraph CI/CD Pipeline
        CodeCommit[Commit de Código] --> Build[Build & Testes]
        Build --> ImagePush[Push Imagens Docker]
        ImagePush --> Deploy[Deploy Automático]
    end
```

---

## Componentes Detalhados

### Frontend (React)
- **Tecnologias**: React, Tailwind CSS, React Router DOM, Axios.
- **Responsabilidade**: Interface de usuário, gerenciamento de estado local, consumo de APIs do backend, roteamento de cliente.
- **Build**: Empacotado com Webpack para gerar arquivos estáticos otimizados. Servido por Nginx em produção.

### Backend (Node.js/Express)
- **Tecnologias**: Node.js, Express.js, Sequelize ORM, bcryptjs, JWT, Joi.
- **Responsabilidade**: Lógica de negócio, validação de dados, autenticação/autorização, persistência de dados, exposição de APIs RESTful.
- **Estrutura**:
  - **Controllers**: Recebem requisições, validam entrada, chamam serviços e formatam respostas.
  - **Services**: Contêm a lógica de negócio principal e interagem com os modelos do banco de dados.
  - **Models**: Definem o esquema do banco de dados e as relações (via Sequelize).
  - **Middleware**: Funções para autenticação (JWT), autorização (restrição por papel), tratamento de erros e encapsulamento de funções assíncronas.
  - **Utils**: Funções auxiliares (geração de tokens, envio de e-mails, etc.).

### Banco de Dados (PostgreSQL)
- **Tecnologias**: PostgreSQL.
- **Responsabilidade**: Armazenamento persistente de todos os dados da aplicação (usuários, pacientes, consultas, prontuários, prescrições).
- **Gerenciamento**: Migrações e seeds controladas pelo Sequelize CLI para garantir a evolução do esquema e a população de dados iniciais.

## Decisões Técnicas Chave
- **Dockerização Completa**: Utilização de Docker e Docker Compose para isolar ambientes, garantir consistência entre desenvolvimento, teste e produção, e facilitar o onboarding de novos desenvolvedores.
- **Separação de Camadas (MVC/Service Layer)**: O backend segue um padrão que separa Controllers (lógica de requisição/resposta), Services (regras de negócio) e Models (interação com o DB), promovendo modularidade e testabilidade.
- **Autenticação Baseada em JWT**: Escolha de JWT para autenticação stateless, permitindo escalabilidade e facilidade de integração.
- **Validação de Dados com Joi**: Uso de Joi para validação robusta e declarativa dos dados de entrada no backend, garantindo a integridade dos dados e fornecendo feedback claro ao frontend.
- **ORM Sequelize**: Utilização de um ORM para abstrair a complexidade das interações com o banco de dados, permitindo trabalhar com objetos JavaScript em vez de SQL puro e facilitando migrações.
- **Gerenciamento de Estado no Frontend (React Context)**: Para autenticação e dados globais, o React Context API é utilizado, evitando a necessidade de bibliotecas de gerenciamento de estado mais complexas para necessidades iniciais.
- **Estilização com Tailwind CSS**: Escolha de um framework CSS utility-first para agilizar o desenvolvimento da interface, promover consistência visual e facilitar a criação de designs responsivos.

## Pré-requisitos
Para configurar e executar o projeto, você precisará ter as seguintes ferramentas instaladas em seu ambiente:

- **Sistema Operacional**: Windows, Linux ou macOS
- **Ferramentas de Containerização**:
  - Docker (versão 20.10 ou superior)
  - Docker Compose (versão 1.29 ou superior)
- **Ambiente de Desenvolvimento (Opcional, para desenvolvimento local sem Docker)**:
  - Node.js (versão 20.14.0 LTS)
  - npm (versão 10.7.0 ou superior)
- **Recursos de Hardware**:
  - **Espaço em Disco**: Pelo menos 5 GB para imagens Docker e dados do banco de dados.
  - **Memória RAM**: Mínimo de 8 GB recomendado para execução suave de todos os serviços.
  - **Conexão com a Internet**: Necessário para baixar imagens Docker e dependências de pacotes.

---

## Configuração do Ambiente

### 1. Clonar o Repositório
Abra seu terminal ou prompt de comando e execute:
```bash
git clone https://github.com/Thisaraiva/medgestor-app.git
cd medgestor-app
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (`medgestor-app/.env`) com as seguintes variáveis. Este arquivo será lido pelo Docker Compose e pelos serviços Node.js.

```env
# Configurações do Banco de Dados Principal (Desenvolvimento/Produção)
DB_NAME=medgestor
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# Configurações do Banco de Dados de Teste (para CI/CD e testes locais)
DB_NAME_TEST=medgestor_test
DB_HOST_TEST=db_test
DB_PORT_TEST=5433 # Porta diferente para evitar conflito com o DB principal

# Configurações do Backend
PORT=5000
NODE_ENV=development # Pode ser 'production' para o ambiente de produção
JWT_SECRET=sua_chave_secreta_para_jwt # **MUITO IMPORTANTE: Altere esta chave para uma string aleatória e segura em produção!**
SEED_DEFAULT_PASSWORD=pass123 # Senha padrão para usuários criados via seeds (apenas para desenvolvimento/teste)

# Configurações do Frontend
REACT_APP_API_URL=http://localhost:5000/api # Para desenvolvimento local, o frontend acessa o backend diretamente
```

**Notas Importantes**:
- `DB_HOST=db` e `DB_HOST_TEST=db_test` correspondem aos nomes dos serviços de banco de dados definidos no `docker-compose.yml`.
- Nunca compartilhe o arquivo `.env` em repositórios públicos. Adicione-o ao seu `.gitignore`.
- A `JWT_SECRET` deve ser uma string longa e complexa.
  * COMO GERAR UMA JWT_SECRET SEGURA (EXECUTE ISSO NO TERMINAL):
    ```bash
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    ```
    OBS: Copie a saída (128 caracteres) e cole no lugar de coloque_aqui_uma_chave_forte. Nunca commite esse arquivo .env (já está no .gitignore)

### 3. Estrutura do Docker Compose
O arquivo `docker-compose.yml` orquestra os serviços da aplicação. Ele define quatro serviços principais: `db` (banco de dados principal), `db_test` (banco de dados para testes), `backend` e `frontend`.

**Serviços Docker Compose**:
- **db**: Contêiner PostgreSQL para o ambiente de desenvolvimento/produção. Persiste dados no volume `db_data`.
- **db_test**: Contêiner PostgreSQL dedicado para a execução de testes, isolando os dados de teste do banco principal.
- **backend**: Contêiner do servidor Node.js. Depende dos serviços de banco de dados estarem saudáveis. Mapeia a porta 5000 do contêiner para a porta 5000 do host.
- **frontend**: Contêiner do frontend React, servido por Nginx. Depende do serviço backend. Mapeia a porta 80 do contêiner (Nginx) para a porta 3000 do host.

### 4. Instalar Dependências
As dependências de Node.js para backend e frontend são instaladas automaticamente durante a construção das imagens Docker (definidas nos respectivos Dockerfiles). Para desenvolvimento local (fora do Docker, se desejar):

```bash
# Para o Backend
cd backend
npm install

# Para o Frontend
cd ../frontend
npm install
```

### 5. Construir e Iniciar Contêineres
Na raiz do projeto (`medgestor-app/`), execute:

```bash
docker-compose up -d --build
```

- `--build`: Garante que as imagens Docker sejam reconstruídas, incorporando quaisquer alterações nos Dockerfiles ou no código-fonte.
- `-d`: Inicia os contêineres em modo "detached" (em segundo plano).

**Verificação dos Contêineres**:
Para verificar o status dos contêineres:

```bash
docker ps
```

Espere ver `medgestor-app-db-1`, `medgestor-app-db_test-1`, `medgestor-app-backend-1`, e `medgestor-app-frontend-1` com status `Up` (ou `healthy` para os bancos de dados).

## Configuração do Banco de Dados

### Scripts Úteis

Acesse o container backend:

```bash
docker exec -it medgestor-app-backend-1 bash
```
**Opção 1:** Alternativamente poderá rodar os comandos no terminal integrado da sua IDE para gerar as migrations e os seeders para criar as tabelas e popular o banco de dados.

Scripts úteis para serem usados após a criação das imagens do Docker:

Na raiz do projeto execute:

```bash
cd backend
docker-compose exec backend npm run migrate:test # 1 - Criar os relacionamentos no banco de dados
docker-compose exec backend npm run seed:test # 2 - Popula o banco de dados com dados iniciais
docker-compose exec backend npm run seed:undo # Opcional - Desfazer os dados iniciais
```

### Esquema do Banco de Dados
O banco de dados `medgestor` (e `medgestor_test`) contém as seguintes tabelas, que representam as entidades principais da aplicação:
- **users**: Armazena informações de usuários do sistema (administradores, médicos, secretárias).
- **patients**: Armazena dados dos pacientes atendidos na clínica.
- **appointments**: Gerencia os agendamentos de consultas.
- **medical_records**: Contém os prontuários médicos dos pacientes.
- **prescriptions**: Armazena as prescrições médicas emitidas.

O arquivo `database/schema.sql` (na pasta `docs/database/`) fornece uma representação SQL do esquema, mas as tabelas são criadas e gerenciadas via migrações do Sequelize.

### Migrações do Banco de Dados
As migrações do Sequelize estão localizadas em `backend/migrations/` e são essenciais para criar e evoluir o esquema do banco de dados de forma controlada. Elas devem ser executadas na ordem cronológica (garantida pelos timestamps no nome do arquivo):
- `2025061001_create_users.js`
- `2025061002_create_patients.js`
- `2025061003_create_appointments.js`
- `2025061004_create_medical_records.js`
- `2025061005_create_prescriptions.js`

**Passos para Executar Migrações**:
1. Acesse o shell do contêiner backend:
   ```bash
   docker exec -it medgestor-app-backend-1 bash
   ```
2. Dentro do contêiner, execute as migrações:
   ```bash
   npx sequelize-cli db:migrate
   ```

**Verificação das Migrações**:
Para verificar se as tabelas foram criadas corretamente, acesse o shell do contêiner `db` e conecte-se ao PostgreSQL:
```bash
docker exec -it medgestor-app-db-1 psql -U postgres -d medgestor
```

Dentro do `psql`, liste as tabelas:
```sql
\dt
```

Você deve ver as tabelas `users`, `patients`, `appointments`, `medical_records`, `prescriptions`, e `SequelizeMeta`. Para sair do `psql`, digite `\q`.

### Seeds (Dados Iniciais)
Os arquivos de seed, localizados em `backend/seeders/`, populam o banco de dados com dados iniciais essenciais para o desenvolvimento e teste da aplicação.

**Passos para Executar Seeds**:
1. Certifique-se de estar no shell do contêiner backend. Se não estiver, acesse-o novamente:
   ```bash
   docker exec -it medgestor-app-backend-1 bash
   ```
2. Dentro do contêiner, execute os seeds:
   ```bash
   npx sequelize-cli db:seed:all # Executa todos os seeds
   ```
   Ou para um seed específico:
   ```bash
   npx sequelize-cli db:seed --seed 01_seed_users.js
   # Repita para 02_seed_patient.js, 03_seed_appointments.js, etc.
   ```

**Verificação dos Dados**:
Para verificar se os dados foram inseridos, conecte-se ao banco de dados e consulte as tabelas:
```sql
SELECT * FROM users;
SELECT * FROM patients;
-- etc.
```

**OBS:** As migrações e seeders poderão ser criados com uma das opções acima descritas, sugiro utilizar a **Opção 1** que pode ser utilizada no próprio terminal da IDE (Esta aplicação foi desenvolvida utilizando o Microsoft VS Code).

## Executando a Aplicação
Após a configuração e as migrações/seeds, a aplicação estará pronta para ser acessada.

### Backend
- **URL Base**: `http://localhost:5000/api`
- **Rotas Principais (Exemplos)**:
  - `POST /api/auth/register`: Cadastro de um novo usuário (requer autenticação e permissão de admin, doctor ou secretary).
  - `POST /api/auth/login`: Autenticação de usuário, retornando um JWT.
  - `GET /api/users`: Lista todos os usuários (requer autenticação e permissão de admin, doctor ou secretary).
  - `GET /api/patients`: Lista todos os pacientes (requer autenticação).

Para uma lista completa de rotas e seus métodos, consulte os arquivos em `backend/routes/`.

### Frontend
- **URL de Acesso**: `http://localhost:3000`

O frontend interage com o backend através da `REACT_APP_API_URL` configurada no `.env` (`http://backend:5000` dentro do Docker Compose, `http://localhost:5000` para acesso direto do navegador).

## Executando Testes (Backend)
Os testes unitários e de integração do backend podem ser executados dentro do contêiner backend ou localmente (se as dependências estiverem instaladas).

**No Contêiner Backend**:
1. Acesse o shell do contêiner:
   ```bash
   docker exec -it medgestor-app-backend-1 bash
   ```
2. Execute os testes:
   ```bash
   npm run test:integration 
   ```

**Localmente (fora do Docker)**:
1. Certifique-se de que as dependências do backend estão instaladas (`cd backend && npm install`).
2. Execute os testes:
   ```bash
   cd backend
   npm run test:integration 
   ```
**OBS:** Após rodar os testes de integração é opcional desfazer os seeds e rodá-los novamente caso queira ter dados iniciais de teste.

---

## Deploy Automático no Render.com (Free Tier)

### Serviços Criados
```
| Serviço       | Tipo            | URL no Render                                 | Status |
|---------------|-----------------|-----------------------------------------------|--------|
| Frontend      | Web Service     | medgestor-frontend-node                       | LIVE   |
| Backend       | Web Service     | medgestor-backend                             | LIVE   |
| PostgreSQL    | PostgreSQL      | dpg-d47uk43ipnbc73d57950-a (Oregon)           | LIVE   |
```

### Passo a passo (GitHub Actions - https://github.com/Thisaraiva/medgestor-app/settings/secrets/actions)

* Repository secrets

* * JWT_SECRET = A mesma gerada e incluída no arquivo .env do backend
* * RENDER_BACKEND_DEPLOY_HOOK=Informação contida nas configurações do Backend no Render.com (Deploy Hook).
* * RENDER_BACKEND_SERVICE_ID=ID do serviço do Frontend contido no Render.com
* * RENDER_FRONTEND_DEPLOY_HOOK=Informação contida nas configurações do Frontend no Render.com (Deploy Hook).
* * RENDER_FRONTEND_SERVICE_ID=ID do serviço do Frontend contido no Render.com
SEED_DEFAULT_PASSWORD=pass123

### Passo a Passo (Render.com)

1. Criar conta gratuita no https://render.com

2. New → Web Service → Conectar GitHub → selecionar repositório → branch main
  - Name: medgestor-frontend-node
  - Region: Oregon (US West) (Deverá ser a mesma do seu serviço de BD e Backend)  
  - Root Directory: frontend
  - Build Command: `npm install && npm run build`
  - Start Command: `npm run serve`
  - Auto-Deploy: `On Commit`
  - Adicionar Variável de ambiente
  - Key: REACT_APP_API_URL
  - Value: https://medgestor-backend.onrender.com/api

4. New → Web Service → Conectar mesmo repositório → branch main
  - Nome: medgestor-backend
  - Region: Oregon (US West)
  - Root Directory: backend
  - Build Command: `npm install`
  - Start Command: `npx sequelize-cli db:migrate --env production && npx sequelize-cli db:seed:all --env production && npm start`
  - Auto-Deploy: `On Commit`
  - Adicionar variáveis de ambiente (todas do Render Dashboard):    
    - `JWT_SECRET` → string aleatória forte criada com o comando anteriormente instruído
    - `NODE_ENV` → production
    - `DB_HOST_PROD` → string de conexão é o ID do PostgreSQL criado no Render.com
    - `DB_NAME_PROD` → medgestor_db
    - `DB_PASSWORD_PROD` → string de conexão gerada nas configurações do PostgreSQL criado no Render.com
    - `DB_PORT_PROD` → 5432
    - `DB_USER_PROD` → admin_medgestor
    - `PORT` → 10000 porta externa default utlizado pelo Render.com
    - `SEED_DEFAULT_PASSWORD` → pass123
        
4. New → PostgreSQL → Oregon → Free Tier
5. Copiar a `DATABASE_URL` gerada e colar no Backend como variável
6. Criar Deploy Hooks em ambos os serviços (Settings → Deploy Hooks)
7. Colar os webhooks no GitHub Actions (secrets: RENDER_DEPLOY_HOOK_FRONTEND e RENDER_DEPLOY_HOOK_BACKEND)

Todo `git push` na main = deploy automático em menos de 2 minutos.

---

## Solução de Problemas Comuns

### 1. Erro: relation "users" does not exist ou tabelas faltando
**Causa**: As migrações do banco de dados não foram executadas ou foram executadas em uma ordem incorreta. Isso pode acontecer se o serviço backend tentar iniciar antes que o banco de dados esteja totalmente pronto ou se as migrações não forem aplicadas.

**Solução**:
1. Verifique o status do contêiner `db` (`docker ps`). Ele deve estar `healthy`.
2. Acesse o shell do contêiner backend (`docker exec -it medgestor-app-backend-1 bash`).
3. Execute as migrações manualmente: `npx sequelize-cli db:migrate`.
4. Se o problema persistir, pode ser necessário limpar o banco de dados de teste (se estiver usando) ou o banco principal e refazer as migrações. Para limpar o banco de dados de teste (ou o principal, com cautela!):
   ```bash
   docker exec -it medgestor-app-db-1 psql -U postgres -d medgestor # ou medgestor_test
   ```
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   \q
   ```
5. Em seguida, reexecute `docker-compose up -d --build` e as migrações.

### 2. Erro: getaddrinfo ENOTFOUND db (ou db_test)
**Causa**: Este erro geralmente ocorre quando você tenta executar comandos que se conectam ao banco de dados (como migrações ou seeds) diretamente no seu host local, mas o `DB_HOST` está configurado para o nome do serviço Docker (`db` ou `db_test`). Seu sistema operacional local não consegue resolver esses nomes.

**Solução**: Sempre execute comandos que interagem com o banco de dados (migrações, seeds, testes de backend que acessam o DB) dentro do contêiner backend via `docker exec -it medgestor-app-backend-1 bash`.

### 3. Contêiner Backend Parando Inesperadamente
**Causa**: Erros de código no backend, problemas de conexão com o banco de dados, ou variáveis de ambiente ausentes/incorretas.

**Solução**:
1. Verifique os logs do contêiner backend para identificar a causa raiz:
   ```bash
   docker logs medgestor-app-backend-1
   ```
2. Confirme se as variáveis de ambiente no seu `.env` estão corretas e se o `backend/.env` (se usado) está bem configurado.
3. Verifique a conexão com o banco de dados em `backend/config/database.js`.

### 4. Vulnerabilidades npm
**Causa**: Dependências do projeto podem ter vulnerabilidades de segurança conhecidas.

**Solução**:
1. Na pasta do backend ou frontend, execute:
   ```bash
   npm audit fix
   ```
2. Se `npm audit fix` não resolver todas as vulnerabilidades, `npm audit fix --force` pode ser necessário (use com cautela, pois pode quebrar dependências).
3. Para vulnerabilidades de baixa severidade que não afetam a funcionalidade ou segurança crítica, você pode optar por ignorá-las, mas é recomendável sempre buscar a atualização ou alternativa.

---

## Boas Práticas Aplicadas e Padrões de Código
- **Separação de Responsabilidades**: Cada serviço (frontend, backend, banco de dados) está em seu próprio contêiner e diretório, promovendo um design modular.
- **Dockerização para Consistência**: Garante que a aplicação funcione de forma idêntica em qualquer ambiente que suporte Docker.
- **Gerenciamento de Esquema com Migrações**: O Sequelize CLI é usado para gerenciar as alterações no esquema do banco de dados de forma controlada e rastreável.
- **Seeds para Dados Iniciais**: Facilita a configuração de ambientes de desenvolvimento e teste com dados predefinidos.
- **Segurança (Senhas e JWT)**: Senhas são armazenadas como hashes (bcryptjs) e a autenticação é gerenciada por tokens JWT seguros.
- **Variáveis de Ambiente**: Todas as configurações sensíveis ou específicas do ambiente são gerenciadas via arquivos `.env`, mantendo o código limpo e seguro.
- **Tratamento Centralizado de Erros**: Middleware de erro no backend para capturar e formatar respostas de erro de forma consistente.
- **Async Handler**: Utilização de um asyncHandler para simplificar o tratamento de erros em rotas assíncronas no Express, evitando repetição de blocos try-catch.
- **Validação de Entrada (Joi)**: Validação rigorosa dos dados de entrada no backend para prevenir vulnerabilidades e garantir a integridade dos dados.
- **Padrões de Código**:
  - **ESLint**: Configurado para garantir consistência no estilo e identificar problemas de código.
  - **Nomenclatura**: Convenções claras para nomes de arquivos, variáveis e funções.
  - **Comentários**: Uso de comentários descritivos para explicar lógica complexa ou decisões importantes.
  - **Testabilidade**: A separação de camadas e o uso de serviços facilitam a escrita de testes unitários e de integração.

---

## Próximos Passos e Roadmap
Este projeto está em constante evolução. Abaixo estão as próximas áreas de foco:

### Backend
- **Implementar Validações Adicionais**: Refinar validações para agendamentos (horários, disponibilidade de médicos), prontuários e prescrições.
- **Adicionar Mais Rotas e Funcionalidades**: Expandir as APIs para cobrir todas as necessidades de gerenciamento da clínica (ex: relatórios, histórico de pacientes).
- **Otimização de Consultas**: Otimizar consultas Sequelize para grandes volumes de dados.
- **Logging Estruturado**: Implementar logging mais detalhado e estruturado para facilitar a depuração e monitoramento em produção.

### Frontend
- **Desenvolver Interface de Usuário Completa**: Continuar a construir e refinar as interfaces para todas as funcionalidades (agendamentos, prontuários, etc.).
- **Gerenciamento de Estado Global**: Avaliar a necessidade de uma solução de gerenciamento de estado mais robusta (ex: Zustand, Redux) à medida que a complexidade aumenta.
- **Notificações ao Usuário**: Implementar um sistema de notificações (toasts) para feedback em tempo real sobre operações.
- **Otimização de Performance**: Otimizar o carregamento de componentes e dados para uma experiência de usuário fluida.

### Testes
- **Testes Unitários Abrangentes**: Aumentar a cobertura de testes de unitários para todos os modelos do  backend.
- **Testes End-to-End (E2E)**: Implementar testes E2E (ex: com Cypress ou Playwright) para simular o fluxo completo do usuário na aplicação.
- **Testes de Performance**: Realizar testes de carga para avaliar o desempenho do sistema sob estresse.

### Deploy e Operações (CI/CD)
- **Monitoramento e Alerta**: Configurar ferramentas de monitoramento para a aplicação em produção (logs, métricas, alertas).

### Documentação
- **Atualização Contínua**: Manter esta documentação atualizada com todas as novas funcionalidades, decisões técnicas e mudanças na arquitetura.
- **Diagramas Adicionais**: Criar diagramas de sequência, componentes e implantação para ilustrar a arquitetura.

---

## Diagramas Adicionais

### Arquitetura do Sistema – MedGestor

**Modelo C4 Completo – Nível 1 ao 3**  

### C4 – Level 1: System Context
```mermaid
graph LR
    subgraph Usuários
        A[Administrador]
        M[Médico]
        S[Secretária]
    end
    A & M & S -->|HTTPS| MedGestor[MedGestor<br/>Sistema Web]
    MedGestor -->|E-mail (futuro)| SMTP
```

### C4 – Level 2: Container Diagram (Produção Atual – Render.com)

```mermaid
graph TD
    U[Usuário] -->|HTTPS| F[Frontend React<br/>Nginx - Render.com]
    F -->|REST API JSON| B[Backend Node.js<br/>Express - Render.com]
    B -->|Sequelize ORM| DB[(PostgreSQL 17<br/>Render Database)]
    B -->|JWT| Auth[Autenticação Stateless]
    
    subgraph "Render.com – Oregon US-West"
        F & B & DB
    end
    
    G[GitHub] -->|Push main| GH[GitHub Actions]
    GH -->|Deploy Hook| F
    GH -->|Deploy Hook| B
```

### C4 – Level 3: Component Diagram (Backend)

```mermaid
graph LR
    Client[Frontend] -->|HTTP| Routes[Routes Express]
    Routes --> Controllers[Controllers]
    Controllers --> Services[Services<br/>(Regras de Negócio)]
    Services --> Models[Sequelize Models]
    Models --> DB[(PostgreSQL)]
    
    Controllers --> Middleware[Middleware<br/>auth, error, asyncHandler]
    Services --> Utils[JWT, UUID]
```

---

### Fluxo Principal – Agendamento + Consulta + Receita

```mermaid
sequenceDiagram
    participant S as Secretária
    participant F as Frontend
    participant B as Backend
    participant DB as PostgreSQL
    
    S->>F: Acessa /agendamentos
    F->>B: POST /api/appointments
    B->>DB: INSERT appointment
    DB-->>B: OK
    B-->>F: 201 Created
    F-->>S: Agendamento criado
    
    Note over S,B: Depois no dia da consulta...
    S->>F: Médico abre prontuário
    F->>B: POST /api/records
    B->>DB: INSERT medical_record
    F->>B: POST /api/prescriptions
    B->>DB: INSERT prescription
    B-->>F: Receita gerada (PDF futuro)
```

---

## Arquitetura do Sistema – Produção (Render.com – Free Tier)

```mermaid
graph TD
    subgraph "Usuários (Navegador)"
        U[Administrador<br/>Médico<br/>Secretária]
    end

    subgraph "Render.com – Oregon US-West"
        F[Frontend<br/>React + Nginx<br/>Static Site]
        B[Backend<br/>Node.js + Express<br/>Web Service]
        DB[(PostgreSQL 17<br/>Render Database)]
    end

    subgraph "GitHub"
        G[Repositório main]
        GA[GitHub Actions]
    end

    U -->|HTTPS| F
    F -->|REST API JSON| B
    B -->|Sequelize ORM| DB
    B -->|JWT + bcrypt| Auth[Autenticação Stateless]

    G -->|git push| GA
    GA -->|Deploy Hook| F
    GA -->|Deploy Hook| B

    style F fill:#10b981,stroke:#065f46,color:white
    style B fill:#3b82f6,stroke:#1e40af,color:white
    style DB fill:#7c3aed,stroke:#4c1d95,color:white
```

### Legenda:

* Verde: Frontend (Web Service – entrega instantânea)
* Azul: Backend (Web Service – sempre ligado)
* Roxo: Banco de Dados (PostgreSQL externo)
* Setas automáticas: CI/CD completo com GitHub Actions + Render Deploy Hooks

---

### Diagrama C4 – Level 2 (Containers – Produção Atual)

```mermaid
graph LR
    User[Usuário] -->|HTTPS| Nginx[Frontend<br/>React + Nginx]
    Nginx -->|HTTP JSON| Express[Backend<br/>Node.js/Express]
    Express -->|Sequelize| Postgres[(PostgreSQL 17<br/>Render)]
    Express -->|JWT| Auth[Auth Service]

    subgraph "Render.com Free Tier"
        Nginx & Express & Postgres
    end
```

---

## Contato
Para dúvidas, sugestões ou contribuições, por favor, entre em contato através do e-mail: thiagofreitassaraiva.com.br ou abra uma issue/pull request no repositório GitHub.

**Última atualização: 18 de novembro de 2025**