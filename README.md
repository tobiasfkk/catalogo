# Sistema de Catálogo - Full Stack com CI/CD Automático

Sistema completo de catálogo de produtos com autenticação JWT, frontend Angular e backend Spring Boot, incluindo pipeline CI/CD automático.

## 📁 Estrutura do Projeto

```
catalogo/
├── jenkins/                    # Jenkins com Docker support
│   ├── docker-compose.yml     # Sobe Jenkins na porta 8080
│   └── Dockerfile             # Jenkins + JDK21 + Docker CLI
├── catalogo-backend/          # ☕ Spring Boot API
│   ├── src/                   # Código Java
│   ├── Dockerfile             # Build da API
│   └── pom.xml               # Dependências Maven
├── catalogo-frontend/         # Angular 20
│   ├── src/                   # Código TypeScript
│   └── Dockerfile            # Build do frontend
├── docker-compose.yml         # 🐳 Orquestra aplicação completa
├── deploy.sh                  # Script de deploy automático
├── Jenkinsfile               # Pipeline CI/CD
└── README.md                 # 📖 Esta documentação
```

## Quick Start

### 1. Subir Jenkins
```bash
cd jenkins
docker-compose up -d
```
**Acesso**: http://localhost:8080 (admin/admin)

### 2. Configurar Pipeline no Jenkins
1. Acesse http://localhost:8080
2. **New Item** → Nome: `catalogo-pipeline` → Tipo: **Pipeline**
3. Na configuração:
   - **Pipeline Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/tobiasfkk/catalogo.git`
   - **Branch Specifier**: `*/main`
   - **Script Path**: `Jenkinsfile`
4. Marcar **Poll SCM**: `H/5 * * * *` (verifica a cada 5 min)
5. **Save**

### 3. Fazer Deploy
```bash
# Criar uma tag para deploy automático
git tag -a v1.5.0 -m "Nova versão"
git push origin v1.5.0

# Jenkins detecta e faz deploy automático!
```

## Workflow CI/CD Automático

- **Push na `main`** → Build & Test automático
- **Nova tag** (`v*.*.*`) → Build, Test & **Deploy automático**

```bash
# Desenvolvimento diário
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
# → Jenkins roda build e testes automaticamente

# Release/Deploy
git tag -a v1.6.0 -m "Release v1.6.0"
git push origin v1.6.0
# → Jenkins faz deploy automático da aplicação
```

## 🐳 Docker Compose Files

### `jenkins/docker-compose.yml`
**Propósito**: Subir o Jenkins CI/CD server  
**Porta**: 8080  
**Uso**: `cd jenkins && docker-compose up -d`

### `docker-compose.yml` (raiz)
**Propósito**: Subir a aplicação completa (usado pelo deploy.sh)  
**Serviços**:
- **database** (PostgreSQL) → porta 5433
- **backend** (Spring Boot API) → porta 8081
- **frontend** (Angular/Nginx) → porta 3000

## URLs da Aplicação

Após o deploy:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081
- **Health Check**: http://localhost:8081/actuator/health
- **Jenkins**: http://localhost:8080

## Credenciais

### Aplicação
- **Admin**: admin / admin123
- **Cliente**: cliente / cliente123

### Jenkins
- **User**: admin
- **Password**: admin

## Desenvolvimento Local

### Backend (Spring Boot)
```bash
cd catalogo-backend
./mvnw spring-boot:run
```

### Frontend (Angular)
```bash
cd catalogo-frontend
npm install
npm start
```

## Deploy Manual
```bash
# Garantir que variáveis de ambiente estejam configuradas
export DB_PASSWORD=postgres123
export JWT_SECRET=seu-secret-aqui

# Executar deploy
./deploy.sh v1.0.0
```

## Stack Tecnológica

- **Backend**: Spring Boot 3.x + PostgreSQL
- **Frontend**: Angular 20 + Material Design
- **CI/CD**: Jenkins LTS + Docker
- **Containers**: Docker + Docker Compose
- **Build**: Maven Wrapper
- **Auth**: JWT (JSON Web Tokens)
