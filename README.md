# Sistema de Catálogo - Full Stack com CI/CD Automático

Sistema completo de catálogo de produtos com autenticação JWT, atualizações em tempo real via WebSocket, frontend Angular standalone e backend Spring Boot, incluindo pipeline CI/CD totalmente automatizado.

## Visão Geral

Aplicação full-stack moderna para gerenciamento de catálogo de produtos com:
- Autenticação e autorização baseada em JWT
- Comunicação em tempo real via WebSocket/STOMP
- CRUD completo de produtos com controle de acesso por perfil
- Interface responsiva e intuitiva
- Pipeline CI/CD automatizado com Jenkins
- Deploy containerizado com Docker

## Tecnologias Utilizadas

### Backend
- **Spring Boot 3.5.7** - Framework principal
- **Spring Security** - Autenticação JWT e autorização
- **Spring WebSocket** - Comunicação bidirecional em tempo real
- **PostgreSQL 15** - Banco de dados relacional
- **JPA/Hibernate** - ORM para persistência
- **Maven** - Gerenciamento de dependências

### Frontend
- **Angular 20** - Framework frontend com standalone components
- **RxJS** - Programação reativa
- **@stomp/stompjs + SockJS** - Cliente WebSocket
- **TypeScript** - Linguagem tipada
- **FormsModule** - Validação de formulários

### DevOps & Infraestrutura
- **Jenkins LTS** - CI/CD automation
- **Docker + Docker Compose** - Containerização e orquestração
- **Nginx Alpine** - Servidor web para frontend
- **Git** - Controle de versão

## Estrutura do Projeto

```
catalogo/
├── jenkins/                    # Configuração do Jenkins
│   ├── docker-compose.yml     # Jenkins na porta 8080
│   └── Dockerfile             # Jenkins + JDK21 + Docker CLI
├── catalogo-backend/          # API Spring Boot
│   ├── src/main/java/         # Código-fonte Java
│   │   ├── config/           # Configurações (Security, WebSocket, CORS)
│   │   ├── controller/       # REST Controllers
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── entity/           # Entidades JPA
│   │   ├── repository/       # Repositórios Spring Data
│   │   ├── security/         # Filtros JWT e utilitários
│   │   └── service/          # Camada de negócio
│   ├── src/main/resources/   
│   │   ├── application.yml   # Configurações da aplicação
│   │   └── data.sql          # Dados iniciais
│   ├── Dockerfile            # Build otimizado multi-stage
│   └── pom.xml               # Dependências Maven
├── catalogo-frontend/         # Aplicação Angular
│   ├── src/app/              # Componentes e serviços
│   │   ├── login/           # Tela de autenticação
│   │   ├── products/        # Listagem e CRUD de produtos
│   │   ├── websocket.service.ts  # Serviço WebSocket
│   │   └── auth.guard.ts    # Guard de proteção de rotas
│   ├── Dockerfile            # Build do frontend com Nginx
│   └── package.json          # Dependências npm
├── docker-compose.yml         # Orquestração completa da aplicação
├── docker-compose.staging.yml # Ambiente de staging
├── docker-compose.prod.yml    # Ambiente de produção
├── Jenkinsfile               # Pipeline declarativo CI/CD
├── deploy.sh                 # Script de deploy
└── README.md                 # Esta documentação
```

## Funcionalidades

### Backend (API REST)
- **Autenticação**: Login com JWT, perfis ADMIN e CLIENTE
- **Produtos**: CRUD completo com autorização por perfil
- **WebSocket**: Notificações em tempo real de mudanças nos produtos
- **Segurança**: CORS configurado, endpoints protegidos por autorização
- **Health Check**: Endpoint `/actuator/health` para monitoramento

### Frontend
- **Login**: Tela de autenticação com validação
- **Catálogo**: Listagem de produtos com filtros e busca
- **CRUD Admin**: Formulário modal para criar/editar/excluir produtos (apenas admin)
- **Tempo Real**: Atualizações automáticas via WebSocket
- **Validação**: Formulários com validação de campos obrigatórios
- **Guards**: Proteção de rotas baseada em autenticação

### CI/CD Pipeline
- **Checkout**: Clone automático do repositório
- **Build & Test**: Compilação e execução de testes unitários
- **Deploy**: Build das imagens Docker e deploy automático
- **Trigger**: Polling SCM a cada 1 minuto detecta mudanças
- **Post Actions**: Notificações de sucesso/falha

## Guia de Instalação

### Pré-requisitos
- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Git**
- **JDK 21** (apenas para desenvolvimento local sem Docker)
- **Node.js 18+** (apenas para desenvolvimento local sem Docker)

### 1. Clonar o Repositório
```bash
git clone https://github.com/tobiasfkk/catalogo.git
cd catalogo
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
DB_PASSWORD=postgres123
JWT_SECRET=my-super-secret-jwt-key-minimum-32-characters-long
```

### 3. Subir Jenkins (Opcional para CI/CD)
```bash
cd jenkins
docker-compose up -d
```

Acesse http://localhost:8080 com as credenciais:
- **Usuário**: admin
- **Senha**: admin

### 4. Configurar Pipeline no Jenkins

1. Acesse Jenkins em http://localhost:8080
2. Clique em **New Item**
3. Digite o nome: `catalogo-pipeline`
4. Selecione **Pipeline** e clique em OK
5. Na configuração do Pipeline:
   - **Pipeline Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/tobiasfkk/catalogo.git`
   - **Branch Specifier**: `*/main`
   - **Script Path**: `Jenkinsfile`
6. Clique em **Save**

### 5. Deploy da Aplicação

#### Opção A: Deploy via Jenkins (Recomendado)
O Jenkins fará o deploy automaticamente a cada push na branch `main`:
```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
# Jenkins detecta e faz deploy automaticamente em ~1 minuto
```

#### Opção B: Deploy Manual
```bash
# Executar script de deploy
./deploy.sh

# Ou usar docker-compose diretamente
docker-compose up -d
```

### 6. Acessar a Aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081
- **Health Check**: http://localhost:8081/actuator/health
- **Documentação API**: Endpoints listados abaixo

## URLs e Endpoints

### Aplicação
| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:3000 | Interface do usuário |
| Backend | http://localhost:8081 | API REST |
| Health | http://localhost:8081/actuator/health | Status da API |
| Jenkins | http://localhost:8080 | CI/CD Server |
| Database | localhost:5433 | PostgreSQL |

### Endpoints da API

#### Autenticação
```
POST /auth/login
POST /auth/register
```

#### Produtos (Públicos)
```
GET  /products              # Listar produtos ativos
GET  /products/{id}         # Buscar produto por ID
GET  /products/search?nome  # Buscar por nome
```

#### Produtos (Admin apenas)
```
POST   /products            # Criar produto
PUT    /products/{id}       # Atualizar produto
DELETE /products/{id}       # Deletar produto
GET    /products/inactive   # Listar produtos inativos
```

#### WebSocket
```
CONNECT /ws                 # Conectar ao WebSocket
SUBSCRIBE /topic/products   # Subscrever a atualizações de produtos
```

## Credenciais de Acesso

### Aplicação
| Perfil | Email | Senha | Permissões |
|--------|-------|-------|------------|
| Admin | admin@loja.com | admin123 | CRUD completo |
| Cliente | cliente@loja.com | cliente123 | Somente leitura |

### Jenkins
- **Usuário**: admin
- **Senha**: admin

### Banco de Dados
- **Host**: localhost:5433
- **Database**: catalogo
- **User**: postgres
- **Password**: postgres123

## Desenvolvimento Local

### Backend sem Docker
```bash
cd catalogo-backend

# Configurar banco local (ou usar Docker apenas para o PostgreSQL)
docker run -d -p 5433:5432 -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=catalogo postgres:15

# Executar aplicação
./mvnw spring-boot:run

# Executar testes
./mvnw test
```

### Frontend sem Docker
```bash
cd catalogo-frontend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start

# Build de produção
npm run build
```

## Pipeline CI/CD

O pipeline Jenkins é configurado no arquivo `Jenkinsfile` e possui as seguintes etapas:

### 1. Declarative: Checkout SCM
- Clone automático do repositório Git
- Detecta mudanças via polling SCM (a cada 1 minuto)

### 2. Build & Test
```groovy
- Compilação do backend com Maven
- Execução de testes unitários
- Validação de qualidade de código
```

### 3. Deploy
```groovy
- Build do JAR do backend (mvn clean package)
- Build da imagem Docker do backend
- Build da imagem Docker do frontend
- Stop e remoção de containers antigos
- Deploy dos novos containers via docker-compose
- Verificação de health dos serviços
```

### 4. Declarative: Post Actions
```groovy
- Notificações de sucesso/falha
- Limpeza de recursos temporários
```

### Trigger Automático
O pipeline é acionado automaticamente a cada push na branch `main` através do polling SCM configurado para verificar a cada 1 minuto.

## Arquitetura

### Diagrama de Componentes
```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ ◄─────► │  Nginx:80    │ ◄─────► │  Angular    │
│             │         │  (Frontend)  │         │  App        │
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               │ HTTP/WS
                               ▼
                        ┌──────────────┐
                        │ Spring Boot  │
                        │   :8080      │
                        │  (Backend)   │
                        └──────────────┘
                               │
                               │ JDBC
                               ▼
                        ┌──────────────┐
                        │ PostgreSQL   │
                        │   :5432      │
                        └──────────────┘
```

### Fluxo de Autenticação
1. Usuário faz login com email/senha
2. Backend valida credenciais e gera JWT
3. Frontend armazena token no localStorage
4. Requisições subsequentes incluem token no header `Authorization: Bearer <token>`
5. Backend valida token via filtro JWT
6. Autorização é verificada via `@PreAuthorize` nos endpoints

### Fluxo de WebSocket
1. Cliente conecta via SockJS em `/ws`
2. Handshake STOMP é realizado
3. Cliente subscreve a `/topic/products`
4. Servidor publica eventos de CRUD de produtos
5. Clientes conectados recebem atualizações em tempo real

## Testes

### Backend
```bash
cd catalogo-backend
./mvnw test
```

Testes incluem:
- Testes unitários dos serviços
- Testes de integração dos repositórios
- Testes dos controllers

### Frontend
```bash
cd catalogo-frontend
npm test
```

## Troubleshooting

### Erro: Port already in use
```bash
# Verificar containers rodando
docker ps

# Parar todos os containers
docker-compose down

# Verificar portas em uso
lsof -i :3000,8080,8081,5433
```

### Erro: Database connection failed
```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Verificar logs do banco
docker logs catalogo-database

# Recriar banco
docker-compose down -v
docker-compose up -d
```

### Erro: Jenkins não acessa Docker
```bash
# Garantir que Jenkins tem acesso ao Docker socket
docker exec jenkins-catalogo docker ps

# Se falhar, recriar Jenkins
cd jenkins
docker-compose down
docker-compose up -d
```

### Frontend com erro 403 em requisições
- Verificar se fez login corretamente
- Verificar token no localStorage do navegador (DevTools > Application > Local Storage)
- Verificar se está usando o email correto: `admin@loja.com` ou `cliente@loja.com`

## Boas Práticas Implementadas

- **Commits Semânticos**: Uso de conventional commits (feat, fix, docs, etc)
- **Separação de Concerns**: Camadas bem definidas (controller, service, repository)
- **Segurança**: JWT, CORS, autorização por perfil, senhas não expostas
- **Containerização**: Aplicação totalmente containerizada
- **Multi-stage Builds**: Imagens Docker otimizadas
- **Health Checks**: Monitoramento de saúde dos serviços
- **Environment Variables**: Configurações sensíveis via variáveis de ambiente
- **Pipeline as Code**: CI/CD definido em código (Jenkinsfile)
- **Standalone Components**: Arquitetura moderna do Angular

## Melhorias Futuras

- Implementar testes E2E com Cypress/Playwright
- Adicionar monitoramento com Prometheus + Grafana
- Implementar cache com Redis
- Adicionar paginação nos endpoints
- Implementar upload de imagens de produtos
- Adicionar documentação da API com Swagger/OpenAPI
- Implementar notificações push
- Adicionar suporte a múltiplos idiomas (i18n)

## Licença

Este projeto é de uso educacional.

## Autor

Desenvolvido como projeto de aprendizado full-stack com CI/CD.

---

**Última atualização**: 13 de Dezembro de 2025
