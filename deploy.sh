#!/bin/bash

# Script de Deploy Local
# Usado pelo Jenkins para fazer deploy da aplicação

set -e  # Parar se houver erro

VERSION=${1:-latest}
echo "==== DEPLOY STARTED - VERSION: $VERSION ===="

# Parar containers em execução (se existirem)
echo ">>> Stopping current application..."
echo "$ docker-compose -f docker-compose.prod.yml down"
docker-compose -f docker-compose.prod.yml down || true

# Remover containers órfãos se existirem
echo ""
echo ">>> Cleaning up old containers..."
echo "$ docker rm -f postgres_catalogo_prod catalogo-backend-prod catalogo-frontend-prod nginx-catalogo-prod"
docker rm -f postgres_catalogo_prod catalogo-backend-prod catalogo-frontend-prod nginx-catalogo-prod 2>/dev/null || true

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
echo "$ docker-compose -f docker-compose.prod.yml up -d"
docker-compose -f docker-compose.prod.yml up -d

# Aguardar e verificar se aplicação subiu
echo ""
echo ">>> Waiting for application to start..."
for i in {1..12}; do
    echo "Verification attempt $i/12..."
    sleep 10
    
    # Verificar se aplicação respondeu nos logs
    if docker-compose -f docker-compose.prod.yml logs api-prod 2>/dev/null | grep -q "Started CatalogoBackendApplication"; then
        echo ""
        echo "==== DEPLOY SUCCESS ===="
        echo "Frontend available at: http://localhost:3000"
        echo "Backend API available at: http://localhost:8081"
        echo "Health check: http://localhost:8081/actuator/health"
        echo ""
        echo ">>> Container status:"
        echo "$ docker ps | grep catalogo"
        docker ps | grep catalogo
        exit 0
    fi
done

echo ""
echo "==== DEPLOY FAILED - TIMEOUT ===="
echo "Application did not start within 2 minutes"
echo ""
echo ">>> Application logs:"
echo "$ docker-compose -f docker-compose.prod.yml logs api-prod --tail=30"
docker-compose -f docker-compose.prod.yml logs api-prod --tail=30
exit 1