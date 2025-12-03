# Configuração do Jenkins

Este diretório contém a configuração para executar Jenkins localmente com Docker.

## Pré-requisitos

- Docker e Docker Compose instalados
- Porta 8090 disponível (Jenkins UI)
- Porta 50000 disponível (Jenkins agents)

## Como iniciar o Jenkins

1. **Inicie os containers:**
```bash
cd jenkins
docker-compose up -d
```

2. **Acesse o Jenkins:**
- URL: http://localhost:8090
- Usuário: admin
- Senha: admin123

3. **Configuração inicial:**
   - Instale os plugins recomendados
   - Configure as credenciais do Docker Hub
   - Configure o Maven e JDK

## Plugins necessários

- Pipeline
- Docker Pipeline
- Maven Integration
- SonarQube Scanner
- JUnit
- Git
- GitHub Integration

## Configuração de credenciais

1. **Docker Hub:**
   - ID: `dockerhub-credentials`
   - Tipo: Username/Password
   - Username: seu usuário do Docker Hub
   - Password: seu token do Docker Hub

2. **GitHub:**
   - ID: `github-credentials`
   - Tipo: SSH Username with private key
   - Adicione sua chave SSH privada

## Configuração de ferramentas

1. **JDK:**
   - Name: JDK-21
   - JAVA_HOME: /opt/java/openjdk

2. **Maven:**
   - Name: Maven-3.9
   - Install automatically: Maven 3.9.x

## Para parar o Jenkins

```bash
docker-compose down
```

## Para backup

```bash
docker-compose exec jenkins tar czf /tmp/jenkins-backup.tar.gz -C /var/jenkins_home .
docker cp jenkins-catalogo:/tmp/jenkins-backup.tar.gz ./jenkins-backup.tar.gz
```