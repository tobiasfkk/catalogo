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

# Aguardar aplicação subir
echo "⏳ Aguardando aplicação inicializar..."
sleep 30

# Verificar se está rodando
echo "🔍 Verificando se aplicação está rodando..."
# Verificar se container está healthy
if docker ps | grep -q "catalogo-backend-prod.*Up"; then
    echo "✅ Deploy realizado com sucesso!"
    echo "📱 Aplicação disponível em: http://localhost:8081"
    echo "🔍 Status dos containers:"
    docker ps | grep catalogo
else
    echo "❌ Falha no deploy - container não está rodando"
    echo "📋 Logs da aplicação:"
    docker-compose -f docker-compose.prod.yml logs api-prod --tail=20
    exit 1
fi