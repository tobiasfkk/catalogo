# Catálogo - CI/CD Simples

## 🚀 Como Usar

### Subir Jenkins
```bash
cd jenkins && docker-compose up --build -d
```
**Acesso**: http://localhost:8080 (admin/admin123)

### Criar Pipeline
1. New Item → `catalogo-pipeline` → Pipeline
2. Git: `https://github.com/tobiasfkk/catalogo.git`
3. Branch: `*/feature/cicd`

### Workflow
- **Push** → Build + Test
- **Tag** → Build + Test + Deploy

```bash
# Deploy
git tag v1.0.0 && git push origin v1.0.0
```

## 📁 Estrutura
```
catalogo/
├── jenkins/              # Jenkins setup
├── catalogo-backend/     # Spring Boot API  
├── catalogo-frontend/    # Frontend
├── docker-compose.prod.yml
└── Jenkinsfile          # Pipeline CI/CD
```