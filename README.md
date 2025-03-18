# medgestor-app
O projeto consiste no desenvolvimento de um aplicativo web para a gestão de consultórios médicos denominado “MedGestor”, focado no agendamento de consultas, gerenciamento de pacientes, histórico de prontuários e emissão de receitas médicas.

# MedGestor - Gestão de Consultórios Médicos

## Nome: Thiago de Freitas Saraiva

## Disciplina: Projeto Portfólio – RFC Final

## 2. Descrição do Projeto

### Tema do Projeto
O projeto consiste no desenvolvimento de um aplicativo web para a gestão de consultórios médicos denominado “MedGestor”, focado no agendamento de consultas, gerenciamento de pacientes, histórico de prontuários e emissão de receitas médicas. O sistema visa modernizar e facilitar a administração de consultórios, oferecendo uma solução centralizada. O “MedGestor” será uma ferramenta intuitiva e segura, projetada para atender às necessidades de médicos, secretárias e pacientes, promovendo eficiência e organização no dia a dia do consultório.

### Funcionalidades Principais:

* Cadastro de Usuários: Diferentes perfis (médicos, administradores, secretárias e pacientes) com níveis de acesso específicos.
* Agendamento de Consultas: Interface para agendar consultas, com distinção entre consultas com ou sem plano de saúde, e entre consultas iniciais ou de retorno.
* Gestão de Pacientes: Cadastro e atualização de informações pessoais e médicas dos pacientes.
* Prontuários Eletrônicos: Armazenamento e consulta de históricos médicos, incluindo diagnósticos, tratamentos e exames.
* Receitas Médicas: Emissão de receitas formatadas, com informações padronizadas e possibilidade de impressão ou envio digital.

### Problemas a Resolver

* **Agendamento ineficiente**: Muitos consultórios ainda utilizam métodos manuais de agendamento (papel ou planilhas) para agendar consultas, são propensos a erros e dificultam a organização. Falta de organização e controle sobre o agendamento de consultas.
    * **Solução**: Interface digital para agendamento rápido e seguro, com confirmações automáticas e lembretes.
* **Falta de centralização de informações**: Dados de pacientes, prontuários e receitas (Modelo Manual) estão dispersos, dificultando o acesso rápido e seguro. Dificuldade no gerenciamento do histórico de pacientes e suas informações.
    * **Solução**: Sistema centralizado que integra todas as informações em um único local.
* **Gestão de diferentes tipos de consultas**: Consultas com ou sem plano de saúde, consultas iniciais ou de retorno exigem diferentes tratamentos e registros.
    * **Solução**: Interface que permite categorizar e filtrar consultas por tipo.
* **Emissão manual de receitas**: A emissão de receitas médicas de forma manual pode levar a erros e falta de padronização. Falta de um repositório centralizado para receitas médicas e prescrições.
    * **Solução**: Emissão automatizada de receitas com modelo pré-formatado.
* **Segurança e privacidade de dados**: Dados médicos são sensíveis e exigem um sistema seguro para armazenamento e acesso. Necessidade de um sistema seguro e acessível para médicos e pacientes.
    * **Solução**: Implementação de medidas de segurança como criptografia, autenticação e autorização.
* **Mitigação da ocorrência de erros**: Redução de erros humanos na marcação de consultas e prescrição de medicamentos.
    * **Solução**: Padronização e definição de modelos que mitigam a possibilidade de erros humanos.

### Limitações

* **Telemedicina**: O sistema não incluirá funcionalidades de telemedicina, como videoconferências ou consultas remotas. O sistema não realizará atendimento online via telemedicina. A complexidade e requisitos técnicos de telemedicina estão fora do escopo inicial.
* **Integração com sistemas externos**: O projeto não abordará a integração com sistemas de planos de saúde, laboratórios ou farmácias. Não será implementada a integração direta com planos de saúde para aprovação de consultas. O foco inicial é na gestão interna do consultório.
* **Pagamentos online**: O sistema não tratará de pagamentos ou transações financeiras relacionadas às consultas. O sistema não realizará pagamentos online para consultas. A gestão financeira exigiria um módulo adicional complexo.
* **Integração com sistemas oficiais**: Não haverá suporte para prescrição eletrônica oficial (assinatura digital reconhecida por órgãos reguladores).
* **Aplicativos para Dispositivos móveis**: A versão inicial será focada em uma aplicação web, sem desenvolvimento de aplicativos móveis nativos. A prioridade é consolidar a funcionalidade web antes de expandir para um aplicativo mobile.

## Especificação Técnica

### 3.1. Requisitos de Software

#### Requisitos Funcionais (RF)

* RF01: O sistema deve permitir o cadastro, edição e remoção de usuários.
* RF02: O sistema deve permitir o cadastro, edição e remoção de pacientes, incluindo informações pessoais (nome, CPF, telefone) e médicas (alergias, histórico).
* RF03: O sistema deve permitir o agendamento, edição e cancelamento de consultas. As receitas são armazenadas com data, medicamentos prescritos e dosagens
* RF04: O sistema deve registrar o histórico de consultas e prontuários dos pacientes. Cada prontuário inclui diagnósticos, tratamentos, exames e observações
* RF05: O sistema deve permitir a emissão e consulta de histórico de receitas médicas. Modelo pré-formatado com informações do médico, paciente e medicamentos.
* RF06: O sistema deve permitir a pesquisa de consultas e histórico de pacientes.
* RF07: O sistema deve gerar relatórios sobre consultas realizadas.
* RF08: O sistema deve permitir emissão de receitas médicas formatadas, com informações padronizadas.
* RF09: O sistema deve permitir agendamento de consultas, com distinção entre consultas com ou sem plano de saúde, e entre consultas iniciais ou de retorno.
* RF10: O sistema deve permitir Inclusão e consulta de prontuários médicos dos pacientes.
* RF11: O sistema deve permitir o agendamento de consultas, permitindo a escolha do profissional e do horário disponível.
* RF12: O sistema deve gerar relatórios de atendimentos realizados para fins administrativos e estatísticos.
* RF13: O sistema deve permitir a busca rápida de pacientes e consultas por meio de filtros e palavras-chave.
* RF14: O sistema deve enviar confirmações de consulta por e-mail/SMS/WhatsApp para pacientes e médicos.

#### Requisitos Não-Funcionais (RNF)

* RNF01: O sistema deve garantir segurança e controle de acesso baseado em perfis de usuários.
* RNF02: O sistema deve ser responsivo e acessível via browser de dispositivos móveis e desktop, compatível com os principais navegadores web.
* RNF03: O sistema deve garantir a integridade dos dados armazenados no banco de dados.
* RNF04: O sistema deve ser escalável e suportar múltiplos usuários simultaneamente, permitindo o aumento de usuários e consultórios.
* RNF05: O sistema deve realizar logs de ações críticas para auditoria.
* RNF06: O sistema deve possuir um tempo de resposta médio inferior a 2 segundos para operações comuns garantindo um uptime de pelo menos 99,5%.
* RNF07: O sistema deve garantir a segurança dos dados, seguindo as diretrizes da LGPD (Lei Geral de Proteção de Dados).
* RNF08: O sistema deve ser implantado em um ambiente cloud, com alta disponibilidade (99,9% uptime).
* RNF09: O código-fonte deve seguir boas práticas de desenvolvimento, como SOLID, Clean Code, YAGNI, KISS e DRY.

#### Representação dos Requisitos

Um diagrama de casos de uso será apresentado para representar visualmente os principais fluxos do sistema. Vide anexo 1.

Um Diagrama de Casos de Uso (UML) será utilizado para representar as interações entre os usuários (atores) e o sistema. Exemplo de atores:

* Secretária: Agenda consultas, cadastra pacientes e gerencia a agenda do médico.
* Médico: Acessa prontuários e emite receitas.
* Paciente: Confirma agendamentos.

### 3.2. Considerações de Design

#### Visão Inicial da Arquitetura

O sistema será desenvolvido com uma arquitetura MVC (Model-View-Controller) para separação clara de responsabilidades:

* Model: Gerencia os dados e a lógica de negócios (ex.: agendamentos, prontuários).
* View: Interface do usuário (ex.: telas de agendamento, prontuários).
* Controller: Intermediário entre Model e View, processando requisições e retornando respostas.

A arquitetura seguirá um padrão baseado em MVC (Model-View-Controller), garantindo a separação de responsabilidades e facilitando a manutenção do sistema.

* Frontend: Desenvolvido com React ou Vue.js para uma interface responsiva e interativa.
* Backend: Desenvolvido com Node.js para gerenciar a lógica de negócios e integração com o banco de dados.
* Banco de Dados: Utilizará PostgreSQL/SQL Server para armazenamento de dados estruturados.

#### Padrões de Arquitetura

* MVC: Para separação clara entre lógica de negócios, interface e dados, para melhor organização do frontend e backend.
* APIs: RESTful APIs para comunicação entre frontend e backend.
* Automação e padronização: CI/CD para automação do deploy e testes.
* Microserviços: Será considerada a divisão em microserviços para escalabilidade futura (ex.: serviço de autenticação, serviço de agendamento).

#### Modelos C4

Esse diagrama é um modelo de documentação de arquitetura de software que usa diagramas hierárquicos. Vide anexo 3.

* Nível de Contexto: Identifica os principais atores e como interagem com o sistema. O sistema interage com médicos, secretárias e pacientes.
* Nível de Contêiner: Define os componentes principais do sistema (Frontend, Backend, Banco de Dados). Frontend (React/Vue.js), Backend (Node.js/Express), Banco de Dados (PostgreSQL/SQL Server).
* Nível de Componente: Detalha os módulos individuais do sistema. Módulos de autenticação e consultas médicas.

### 3.3. Stack Tecnológica

#### Linguagens de Programação

* Javascript e Typescript: Para desenvolvimento frontend e backend. Escolhidos por sua versatilidade e ampla adoção no desenvolvimento web.
* HTML/CSS: Para a construção e estilização da interface do usuário.

#### Frameworks e Bibliotecas

* Frontend: React ou Vue.js para construção de interfaces dinâmicas e responsivas. Para o desenvolvimento do frontend.
* Backend: Node.js com Express para criação de APIs RESTful. Para o desenvolvimento do backend.
* Banco de Dados: PostgreSQL/SQL Server para armazenamento de dados relacionais com a utilização de Sequelize ou TypeORM para interação com o banco de dados.

#### Banco de Dados

* PostgreSQL ou SQL Server: Banco de dados relacional para armazenamento de informações.

#### Ferramentas de Desenvolvimento e Gestão de Projeto

* Versionamento: Git e GitHub para controle de versão.
* Gerenciamento de Projeto: GitHub Project, Azure DevOps ou Trello, para gerenciamento de tarefas.
* Automatização CI/CD: GitHub Actions para integração e deploy contínuos.
* Análise de Código: Ferramenta SonarQube/SonarCloud para análise e tentativa de garantir qualidade e segurança do código.
* Containerização: Ferramenta Docker para containerização da aplicação.
* Monitoramento: Datadog ou New Relic para observabilidade e performance.
* Infraestrutura: (opcional) Terraform Para provisionamento da infraestrutura.

### 3.4. Considerações de Segurança

* Autenticação e Autorização: Uso de JWT (JSON Web Tokens) ou OAuth para autenticação segura e controle de acesso.
* Criptografia de Dados: Armazenamento seguro de senhas usando bcrypt. Dados sensíveis (como senhas e informações médicas) serão criptografados.
* Proteção contra Ataques: Implementação de medidas contra SQL Injection, XSS (Cross-Site Scripting) e CSRF (Cross-Site Request Forgery).
* Backup e Recuperação: Definição de políticas de backup periódico para recuperação de dados.

## Anexo 1: Diagrama de Casos de Uso (UML)

### Atores

1. Secretária: Responsável por agendar consultas, cadastrar pacientes e gerenciar a agenda do médico.
2. Médico: Acessa prontuários, emite receitas e visualiza a agenda de consultas.
3. Paciente: Confirma agendamento e realiza consulta médica.

### Casos de Uso

1. Secretária
    * Agendar Consulta: A secretária agenda uma consulta para um paciente, definindo data, horário e tipo de consulta (inicial, retorno, com ou sem plano de saúde) e selecionando o profissional médico.
2. Médico
    * Realizar Consulta do Paciente: O médico visualiza sua agenda de consultas. O médico visualiza o prontuário de um paciente, incluindo histórico de consultas, diagnósticos e tratamentos. O médico emite uma receita médica para um paciente, com medicamentos prescritos e dosagens.
3. Paciente
    * Confirmar Agendamento: O paciente confirma a sua consulta agendada.
    * Realizar Consulta Médica: Paciente realiza consulta médica na data e hora agendada.

### Descrição do Diagrama

1. Atores:
    * Secretária, Médico e Paciente são representados como figuras humanas (stick figures) fora do sistema.
2. Casos de Uso:
    * Cada caso de uso é representado por uma elipse com o nome da funcionalidade (ex.: "Agendar Consulta").
    * Os casos de uso são conectados aos atores por linhas, indicando quem realiza cada ação.
3. Relações:
    * Secretária está conectada a:
        * Agendar Consulta
    * Médico está conectado a:
        * Selecionar Consulta
        * Consultar Histórico
        * Preencher Prontuário
        * Emitir Receita
    * Paciente está conectado a:
        * Confirmar Consulta
        * Realizar consulta médica

     ![image](https://github.com/user-attachments/assets/e31172b1-fc83-4909-8d1b-cc90d7975f12)

   ### Diagrama de Classes

   ![image](https://github.com/user-attachments/assets/f000d430-7570-4ea9-b6e4-0304b1546ca3)

   ### Anexo 3: Diagrama Modelo C4

   ![image](https://github.com/user-attachments/assets/7665caff-7224-4ed1-88c2-56c4e2dcfe8e)

   ![image](https://github.com/user-attachments/assets/d32f2dbb-1a2e-4398-a4ee-1526151cce80)

   ![image](https://github.com/user-attachments/assets/1707494b-3baa-44a0-b3e1-3d1a58b9cc71)

   ![image](https://github.com/user-attachments/assets/61942e82-59cb-40b6-acdd-4bf0ec792d1a)
