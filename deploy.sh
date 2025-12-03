#!/bin/bash

# Script de Deploy Local
# Usado pelo Jenkins para fazer deploy da aplicação

set -e  # Parar se houver erro

VERSION=${1:-latest}
echo "🚀 ==== DEPLOY STARTED - VERSION: $VERSION ===="
echo "📅 $(date '+%Y-%m-%d %H:%M:%S')"
echo "🔧 Jenkins Build: ${BUILD_NUMBER:-N/A}"
echo "🌱 Git Branch/Tag: ${GIT_BRANCH:-N/A}"
echo ""

# Parar containers em execução (se existirem)
echo ">>> Stopping current application..."
echo "$ docker-compose down"
docker-compose down || true

# Remover containers órfãos se existirem
echo ""
echo ">>> Cleaning up old containers..."
echo "$ docker rm -f catalogo-database catalogo-backend catalogo-frontend postgres_catalogo_prod catalogo-backend-prod catalogo-frontend-prod"
docker rm -f catalogo-database catalogo-backend catalogo-frontend postgres_catalogo_prod catalogo-backend-prod catalogo-frontend-prod 2>/dev/null || true

echo ">>> Checking for containers using our ports..."
echo "$ docker ps --filter publish=3000 --filter publish=8081 --filter publish=5433 -q | xargs -r docker stop"
docker ps --filter publish=3000 --filter publish=8081 --filter publish=5433 -q | xargs -r docker stop 2>/dev/null || true

# Construir nova imagem do backend
echo ""
echo ">>> Building backend Docker image..."
echo "$ cd catalogo-backend"
cd catalogo-backend
echo "$ docker build -t catalogo-backend:$VERSION -f Dockerfile ."
docker build -t catalogo-backend:$VERSION -f Dockerfile .
echo "$ docker tag catalogo-backend:$VERSION catalogo-backend:latest"
docker tag catalogo-backend:$VERSION catalogo-backend:latest
echo "$ cd .."
cd ..

# Construir nova imagem do frontend
echo ""
echo ">>> Building frontend Docker image..."
echo "$ cd catalogo-frontend"
cd catalogo-frontend
echo "$ docker build -t catalogo-frontend:$VERSION -f Dockerfile ."
docker build -t catalogo-frontend:$VERSION -f Dockerfile .
echo "$ docker tag catalogo-frontend:$VERSION catalogo-frontend:latest"
docker tag catalogo-frontend:$VERSION catalogo-frontend:latest
echo "$ cd .."
cd ..

# Subir nova versão
echo ""
echo ">>> Starting new version..."
echo "$ export DB_PASSWORD=${DB_PASSWORD:-postgres123}"
export DB_PASSWORD=${DB_PASSWORD:-postgres123}
echo "$ docker-compose up -d --remove-orphans"
docker-compose up -d --remove-orphans

# Aguardar e verificar se aplicação subiu
echo ""
echo ">>> Waiting for application to start..."
for i in {1..12}; do
    echo "Verification attempt $i/12..."
    sleep 10
    
    # Verificar se aplicação respondeu nos logs
    if docker-compose logs backend 2>/dev/null | grep -q "Started CatalogoBackendApplication"; then
        echo ""
        echo "✅ ==== DEPLOY SUCCESS - VERSION: $VERSION ===="
        echo "🌐 Frontend available at: http://localhost:3000"
        echo "🔥 Backend API available at: http://localhost:8081"
        echo "💚 Health check: http://localhost:8081/actuator/health"
        echo "📊 Admin login: admin/admin123"
        echo "👤 Client login: cliente/cliente123"
        echo ""
        echo ">>> Container status:"
        echo "$ docker ps | grep catalogo"
        docker ps | grep catalogo
        exit 0
    fi
done

echo ""
echo "❌ ==== DEPLOY FAILED - TIMEOUT - VERSION: $VERSION ===="
echo "Application did not start within 2 minutes"
echo ""
echo ">>> Application logs:"
echo "$ docker-compose logs backend --tail=30"
docker-compose logs backend --tail=30
exit 1