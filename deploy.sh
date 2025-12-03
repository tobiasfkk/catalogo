#!/bin/bash

# Script de Deploy Local
# Usado pelo Jenkins para fazer deploy da aplicação

set -e  # Parar se houver erro

VERSION=${1:-latest}
echo "🚀 Iniciando deploy da versão: $VERSION"

# Parar containers em execução (se existirem)
echo "🛑 Parando aplicação atual..."
docker-compose -f docker-compose.prod.yml down || true

# Remover containers órfãos se existirem
echo "🧹 Limpando containers antigos..."
docker rm -f postgres_catalogo_prod catalogo-backend-prod nginx-catalogo-prod 2>/dev/null || true

# Construir nova imagem
echo "🔨 Construindo nova imagem..."
cd catalogo-backend
docker build -t catalogo-backend:$VERSION -f Dockerfile .
docker tag catalogo-backend:$VERSION catalogo-backend:latest
cd ..

# Subir nova versão
echo "🆙 Subindo nova versão..."
export DB_PASSWORD=${DB_PASSWORD:-postgres123}
docker-compose -f docker-compose.prod.yml up -d

# Aguardar e verificar se aplicação subiu
echo "⏳ Aguardando aplicação inicializar..."
for i in {1..12}; do
    echo "🔍 Verificação $i/12..."
    sleep 10
    
    # Verificar se aplicação respondeu nos logs
    if docker-compose -f docker-compose.prod.yml logs api-prod 2>/dev/null | grep -q "Started CatalogoBackendApplication"; then
        echo "✅ Deploy realizado com sucesso!"
        echo "📱 Aplicação disponível em: http://localhost:8081"
        echo "🔍 Status dos containers:"
        docker ps | grep catalogo
        exit 0
    fi
done

echo "❌ Timeout - aplicação não inicializou completamente"
echo "📋 Logs da aplicação:"
docker-compose -f docker-compose.prod.yml logs api-prod --tail=30
exit 1