#!/bin/bash

# Script para deployment automático
# Usage: ./deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
PROJECT_NAME="catalogo"
BACKUP_DIR="./backups"

echo "🚀 Iniciando deployment para $ENVIRONMENT..."

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Função para fazer backup do banco
backup_database() {
    local env=$1
    local container_name="postgres_${PROJECT_NAME}_${env}"
    local backup_file="${BACKUP_DIR}/backup_${env}_$(date +%Y%m%d_%H%M%S).sql"
    
    echo "📦 Fazendo backup do banco de dados..."
    docker exec $container_name pg_dump -U postgres catalogo_db_${env} > $backup_file
    echo "✅ Backup salvo em: $backup_file"
}

# Função para verificar health check
wait_for_health() {
    local service_url=$1
    local max_attempts=30
    local attempt=1
    
    echo "🔍 Aguardando serviço ficar disponível..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f $service_url > /dev/null 2>&1; then
            echo "✅ Serviço está saudável!"
            return 0
        fi
        
        echo "⏳ Tentativa $attempt/$max_attempts..."
        sleep 10
        ((attempt++))
    done
    
    echo "❌ Serviço não ficou disponível após $max_attempts tentativas"
    return 1
}

# Deployment para staging
deploy_staging() {
    echo "🔄 Fazendo deploy para STAGING..."
    
    # Backup se o container existir
    if docker ps -q --filter "name=postgres_${PROJECT_NAME}_staging" | grep -q .; then
        backup_database "staging"
    fi
    
    # Deploy
    docker-compose -f docker-compose.staging.yml down
    docker-compose -f docker-compose.staging.yml pull
    docker-compose -f docker-compose.staging.yml up -d
    
    # Health check
    wait_for_health "http://localhost:8081/actuator/health"
    
    echo "✅ Deploy para STAGING concluído!"
}

# Deployment para produção
deploy_production() {
    echo "🔄 Fazendo deploy para PRODUÇÃO..."
    
    # Verificar se arquivo .env existe
    if [ ! -f ".env" ]; then
        echo "❌ Arquivo .env não encontrado. Copie .env.example para .env e configure as variáveis."
        exit 1
    fi
    
    # Backup obrigatório para produção
    if docker ps -q --filter "name=postgres_${PROJECT_NAME}_prod" | grep -q .; then
        backup_database "prod"
    fi
    
    # Confirmação manual
    echo "⚠️  Você está prestes a fazer deploy para PRODUÇÃO!"
    read -p "Digite 'YES' para confirmar: " confirmation
    
    if [ "$confirmation" != "YES" ]; then
        echo "❌ Deploy cancelado."
        exit 1
    fi
    
    # Deploy
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml pull
    docker-compose -f docker-compose.prod.yml up -d
    
    # Health check
    wait_for_health "http://localhost:8080/actuator/health"
    
    echo "✅ Deploy para PRODUÇÃO concluído!"
}

# Execução principal
case $ENVIRONMENT in
    "staging")
        deploy_staging
        ;;
    "production")
        deploy_production
        ;;
    *)
        echo "❌ Ambiente inválido. Use: staging ou production"
        exit 1
        ;;
esac

echo "🎉 Deploy concluído com sucesso!"