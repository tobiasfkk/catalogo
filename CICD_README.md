# CI/CD Pipeline para Catálogo Backend

Este projeto possui um pipeline completo de CI/CD usando Jenkins que automatiza:

## 🏗️ Estrutura do Pipeline

### Stages principais:
1. **Checkout** - Baixa o código fonte
2. **Build** - Compila o projeto com Maven
3. **Test** - Executa testes unitários
4. **Code Quality** - Análise SonarQube e security scan
5. **Package** - Gera o JAR da aplicação
6. **Docker Build** - Cria imagem Docker otimizada
7. **Deploy Staging** - Deploy automático para ambiente de teste
8. **Integration Tests** - Testes de integração
9. **Deploy Production** - Deploy manual para produção

## 🚀 Como configurar

### 1. Iniciar Jenkins
```bash
cd jenkins
docker-compose up -d
```
Acesse: http://localhost:8090 (admin/admin123)

### 2. Configurar credenciais no Jenkins
- Docker Hub: `dockerhub-credentials`
- GitHub: `github-credentials` 
- SonarQube: Configure se necessário

### 3. Criar pipeline
1. New Item → Pipeline
2. Pipeline from SCM → Git
3. Repository URL: seu repositório
4. Script Path: `Jenkinsfile`

### 4. Configurar ambientes

#### Staging (automático em branch develop)
```bash
# Usa docker-compose.staging.yml
# Porta: 8081
```

#### Production (manual em branch main)
```bash
# Crie arquivo .env baseado em .env.example
cp .env.example .env
# Configure variáveis de produção
# Usa docker-compose.prod.yml
# Porta: 8080
```

## 📦 Scripts de deploy

### Linux/Mac
```bash
./scripts/deploy.sh staging
./scripts/deploy.sh production
```

### Windows
```cmd
scripts\deploy.bat staging
scripts\deploy.bat production
```

## 🔧 Configurações importantes

### Branches
- `main`: Deploy para produção (manual)
- `develop`: Deploy para staging (automático)
- Outras: Apenas build e test

### Portas utilizadas
- **Jenkins**: 8090
- **Staging**: 8081
- **Production**: 8080
- **PostgreSQL Staging**: 5435
- **PostgreSQL Production**: 5433

### Health Checks
- Staging: http://localhost:8081/actuator/health
- Production: http://localhost:8080/actuator/health

## 📊 Monitoramento

### Logs
```bash
# Ver logs da aplicação
docker logs catalogo-backend-prod -f

# Ver logs do banco
docker logs postgres_catalogo_prod -f
```

### Backup automático
Os scripts fazem backup automático antes do deploy para produção.
Backups ficam em: `./backups/`

## 🔒 Segurança

- Imagens Docker otimizadas com usuário não-root
- HTTPS com Nginx (configure certificados)
- Rate limiting configurado
- Security headers aplicados
- Variáveis sensíveis em .env

## ⚙️ Extensões possíveis

1. **SonarQube**: Análise de qualidade de código
2. **Prometheus/Grafana**: Métricas e dashboards
3. **ELK Stack**: Logs centralizados
4. **Kubernetes**: Orquestração avançada
5. **ArgoCD**: GitOps deployment

## 🆘 Troubleshooting

### Container não sobe
```bash
docker-compose logs api-prod
```

### Build falha
- Verifique se JDK 21 está configurado no Jenkins
- Confirme se Maven está instalado
- Check logs no Jenkins

### Deploy falha
- Verifique se .env está configurado
- Confirme conectividade com banco
- Check health endpoints

## 📝 Comandos úteis

```bash
# Rebuild completo
docker-compose down -v
docker-compose up --build -d

# Limpar imagens antigas
docker system prune -a

# Backup manual do banco
docker exec postgres_catalogo_prod pg_dump -U postgres catalogo_db > backup.sql

# Restaurar backup
cat backup.sql | docker exec -i postgres_catalogo_prod psql -U postgres -d catalogo_db
```