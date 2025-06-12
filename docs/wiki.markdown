# Documentação do Projeto MedGestor

## Visão Geral

O **MedGestor** é uma aplicação web para gerenciamento de clínicas médicas, permitindo o cadastro de usuários (administradores, médicos e secretárias), pacientes, consultas, prontuários e prescrições. O projeto é estruturado em três componentes principais: banco de dados (PostgreSQL), backend (Node.js com Express e Sequelize), e frontend (React com Webpack). A aplicação utiliza Docker para orquestração dos serviços, garantindo portabilidade e consistência entre ambientes.

### Objetivo
Automatizar processos de clínicas médicas, como agendamento de consultas, gerenciamento de prontuários e emissão de prescrições, com uma interface amigável e segura.

### Tecnologias Utilizadas
- **Banco de Dados**: PostgreSQL 17
- **Backend**: Node.js 20.14.0, Express, Sequelize ORM
- **Frontend**: React, Webpack
- **Orquestração**: Docker, Docker Compose
- **Outras Ferramentas**:
  - bcryptjs (hash de senhas)
  - uuid (geração de IDs)
  - Sequelize CLI (migrações e seeds)

---

## Estrutura do Projeto

O repositório está organizado da seguinte forma:

```
medgestor-app/
├── backend/                    # Código do backend (Node.js/Express)
│   ├── config/                 # Configurações do backend
│   │   ├── config.js           # Configurações do Sequelize CLI
│   │   └── database.js         # Instância do Sequelize
│   ├── migrations/             # Arquivos de migração do banco
│   │   ├── 202506100000_create_users.js
│   │   ├── 202506100001_create_patients.js
│   │   ├── 202506100002_create_appointments.js
│   │   ├── 202506100003_create_medical_records.js
│   │   └── 202506100004_create_prescriptions.js
│   ├── models/                 # Modelos Sequelize
│   │   ├── Appointment.js
│   │   ├── MedicalRecord.js
│   │   ├── Patient.js
│   │   ├── Prescription.js
│   │   ├── User.js
│   │   └── index.js
│   ├── routes/                 # Rotas da API
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── recordRoutes.js
│   │   └── prescriptionRoutes.js
│   ├── seeders/                # Arquivos de seed
│   │   └── seed_users.js
│   ├── middleware/             # Middlewares (ex.: error handling)
│   │   └── errorMiddleware.js
│   ├── tests/                  # Testes unitários e de integração
│   │   └── auth.test.js
│   ├── .sequelizerc            # Configuração do Sequelize CLI
│   ├── package.json            # Dependências do backend
│   └── server.js               # Ponto de entrada do backend
├── frontend/                   # Código do frontend (React)
│   ├── src/                    # Código-fonte React
│   ├── public/                 # Arquivos estáticos
│   ├── package.json            # Dependências do frontend
│   └── webpack.config.js       # Configuração do Webpack
├── database/                   # Arquivos de referência do banco
│   └── schema.sql              # Esquema do banco (documentação)
├── docs/                       # Documentação do projeto
│   └── wiki.md                 # Este arquivo
├── .env                        # Variáveis de ambiente
├── .gitignore                  # Arquivos ignorados pelo Git
├── docker-compose.yml          # Configuração do Docker Compose
└── README.md                   # Visão geral do projeto
```

---

## Pré-requisitos

Para configurar e executar o projeto, você precisará:

- **Sistema Operacional**: Windows, Linux ou macOS
- **Ferramentas**:
  - Docker (versão 20.10 ou superior)
  - Docker Compose (versão 1.29 ou superior)
  - Node.js (versão 20.14.0, opcional para desenvolvimento local)
  - npm (versão 10.7.0 ou superior, opcional)
- **Espaço em Disco**: Pelo menos 5 GB para imagens Docker e dados do banco
- **Conexão com a Internet**: Para baixar imagens Docker e dependências

---

## Configuração do Ambiente

### 1. Clonar o Repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd medgestor-app
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de Dados
DB_NAME=medgestor
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# Backend
PORT=5000
NODE_ENV=development

# Frontend
REACT_APP_API_URL=http://backend:5000
```

- **Notas**:
  - `DB_HOST=db` corresponde ao nome do serviço no `docker-compose.yml`.
  - Não compartilhe o arquivo `.env` em repositórios públicos.

### 3. Estrutura do Docker Compose
O arquivo `docker-compose.yml` define três serviços:

```yaml
version: '3.8'
services:
  db:
    image: postgres:17
    environment:
      - POSTGRES_DB=medgestor
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
  backend:
    build:
      context: ./backend
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend:/app
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
  frontend:
    build:
      context: ./frontend
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
    ports:
      - "3000:3000"
volumes:
  db_data:
networks:
  default:
    name: medgestor-network
```

- **Serviços**:
  - **db**: Executa PostgreSQL, persiste dados no volume `db_data`.
  - **backend**: Executa o servidor Node.js, depende do banco estar saudável.
  - **frontend**: Executa o frontend React, depende do backend.

### 4. Instalar Dependências
As dependências são instaladas automaticamente pelo Docker. Para desenvolvimento local (opcional):

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Construir e Iniciar Contêineres
```bash
cd C:\Programacao\Projetos\JavaScript\medgestor-app
docker-compose up -d
```

- **Verificação**:
  ```bash
  docker ps
  ```
  Espere ver `medgestor-app-db-1`, `medgestor-app-backend-1`, e `medgestor-app-frontend-1` com status `Up` (ou `healthy` para o banco).

---

## Configuração do Banco de Dados

### Esquema
O banco de dados `medgestor` contém as seguintes tabelas:

1. **users**: Usuários (admin, doctor, secretary).
2. **patients**: Pacientes.
3. **appointments**: Consultas.
4. **medical_records**: Prontuários.
5. **prescriptions**: Prescrições.

O arquivo `database/schema.sql` documenta o esquema, mas as tabelas são criadas via migrações.

### Migrações
As migrações estão em `backend/migrations` e devem ser executadas na ordem correta:

1. `202506100000_create_users.js`
2. `202506100001_create_patients.js`
3. `202506100002_create_appointments.js`
4. `202506100003_create_medical_records.js`
5. `202506100004_create_prescriptions.js`

**Passos**:
1. Acesse o contêiner backend:
   ```bash
   docker exec -it medgestor-app-backend-1 bash
   ```

2. Execute as migrações:
   ```bash
   npx sequelize-cli db:migrate
   ```

3. **Verificação**:
   - Acesse o banco:
     ```bash
     docker exec -it medgestor-app-db-1 psql -U postgres -d medgestor
     ```
   - Liste tabelas:
     ```sql
     \dt
     ```
   - Saia:
     ```sql
     \q
     ```

### Seeds
O arquivo `backend/seeders/seed_users.js` popula as tabelas `users` e `patients` com dados iniciais.

**Passos**:
1. No contêiner backend:
   ```bash
   npx sequelize-cli db:seed --seed seed_users.js
   ```

2. **Verificação**:
   ```sql
   SELECT * FROM users;
   SELECT * FROM patients;
   ```

---

## Executando a Aplicação

### Backend
- Acesse: `http://localhost:5000`
- Rotas principais:
  - `POST /api/auth/register`: Cadastra um usuário.
  - `POST /api/auth/login`: Autentica um usuário.
  - `GET /api/patients`: Lista pacientes (autenticado).
  - Consulte `backend/routes/` para detalhes.

### Frontend
- Acesse: `http://localhost:3000`
- O frontend faz chamadas à API via `REACT_APP_API_URL=http://backend:5000`.

### Testes
Execute testes no backend:
```bash
cd backend
npm test
```

---

## Solução de Problemas

### 1. Erro: `relation "users" does not exist`
- **Causa**: A migração `appointments` foi executada antes de `users`.
- **Solução**:
  - Limpe o banco:
    ```sql
    DROP TABLE IF EXISTS SequelizeMeta CASCADE;
    ```
  - Verifique a ordem das migrações em `backend/migrations`.
  - Reexecute as migrações:
    ```bash
    npx sequelize-cli db:migrate
    ```

### 2. Erro: `getaddrinfo ENOTFOUND db`
- **Causa**: Migrações executadas localmente, onde `DB_HOST=db` não é resolvido.
- **Solução**: Execute dentro do contêiner backend.

### 3. Contêiner Backend Parando
- **Causa**: Erros no código ou conexão com o banco.
- **Solução**:
  - Verifique logs:
    ```bash
    docker logs medgestor-app-backend-1
    ```
  - Confirme conexão em `backend/config/config.js`.

### 4. Vulnerabilidades npm
- **Causa**: Dependências com vulnerabilidades de baixa severidade.
- **Solução**:
  - Execute:
    ```bash
    npm audit fix
    ```
  - Ignore vulnerabilidades menores ou atualize dependências manualmente.

---

## Boas Práticas Aplicadas

- **Separação de Responsabilidades**: Contêineres separados para banco, backend, e frontend.
- **Dockerização**: Uso de Docker Compose para consistência entre ambientes.
- **Migrações**: Gerenciamento do esquema via Sequelize CLI, com ordem garantida por timestamps.
- **Segurança**: Senhas hasheadas com bcrypt, variáveis de ambiente no `.env`.
- **Documentação**: Estrutura clara em Markdown para consulta.

---

## Próximos Passos

1. **Backend**:
   - Implementar validações (ex.: CPF, horários de consultas).
   - Adicionar mais rotas e funcionalidades.
2. **Frontend**:
   - Integrar com a API.
   - Desenvolver interface de usuário.
3. **Testes**:
   - Criar testes de integração e end-to-end.
4. **Deploy**:
   - Planejar deploy em AWS, DigitalOcean, ou similar.
5. **Documentação**:
   - Atualizar este arquivo com novas funcionalidades.

---

## Contato
Para dúvidas ou contribuições, entre em contato via [inserir e-mail ou canal de comunicação].

**Última Atualização**: 12 de junho de 2025