@echo off
REM Script para deployment automático no Windows
REM Usage: deploy.bat [staging|production]

setlocal enabledelayedexpansion

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=staging

set PROJECT_NAME=catalogo
set BACKUP_DIR=.\backups

echo 🚀 Iniciando deployment para %ENVIRONMENT%...

REM Criar diretório de backup se não existir
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

REM Função para fazer backup do banco
:backup_database
set env=%1
set container_name=postgres_%PROJECT_NAME%_%env%
set backup_file=%BACKUP_DIR%\backup_%env%_%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql

echo 📦 Fazendo backup do banco de dados...
docker exec %container_name% pg_dump -U postgres catalogo_db_%env% > %backup_file%
echo ✅ Backup salvo em: %backup_file%
goto :eof

REM Função para verificar health check
:wait_for_health
set service_url=%1
set max_attempts=30
set attempt=1

echo 🔍 Aguardando serviço ficar disponível...

:health_loop
curl -f %service_url% >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Serviço está saudável!
    goto :eof
)

echo ⏳ Tentativa %attempt%/%max_attempts%...
timeout /t 10 /nobreak >nul
set /a attempt+=1

if %attempt% leq %max_attempts% goto health_loop

echo ❌ Serviço não ficou disponível após %max_attempts% tentativas
exit /b 1

REM Deployment para staging
:deploy_staging
echo 🔄 Fazendo deploy para STAGING...

REM Verificar se container existe
docker ps -q --filter "name=postgres_%PROJECT_NAME%_staging" | findstr . >nul
if %errorlevel%==0 call :backup_database staging

REM Deploy
docker-compose -f docker-compose.staging.yml down
docker-compose -f docker-compose.staging.yml pull
docker-compose -f docker-compose.staging.yml up -d

REM Health check
call :wait_for_health "http://localhost:8081/actuator/health"

echo ✅ Deploy para STAGING concluído!
goto :eof

REM Deployment para produção
:deploy_production
echo 🔄 Fazendo deploy para PRODUÇÃO...

REM Verificar se arquivo .env existe
if not exist ".env" (
    echo ❌ Arquivo .env não encontrado. Copie .env.example para .env e configure as variáveis.
    exit /b 1
)

REM Backup obrigatório para produção
docker ps -q --filter "name=postgres_%PROJECT_NAME%_prod" | findstr . >nul
if %errorlevel%==0 call :backup_database prod

REM Confirmação manual
echo ⚠️  Você está prestes a fazer deploy para PRODUÇÃO!
set /p confirmation=Digite 'YES' para confirmar: 

if not "%confirmation%"=="YES" (
    echo ❌ Deploy cancelado.
    exit /b 1
)

REM Deploy
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

REM Health check
call :wait_for_health "http://localhost:8080/actuator/health"

echo ✅ Deploy para PRODUÇÃO concluído!
goto :eof

REM Execução principal
if "%ENVIRONMENT%"=="staging" (
    call :deploy_staging
) else if "%ENVIRONMENT%"=="production" (
    call :deploy_production
) else (
    echo ❌ Ambiente inválido. Use: staging ou production
    exit /b 1
)

echo 🎉 Deploy concluído com sucesso!