pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'catalogo-backend'
    }
    
    stages {
        stage('Build & Test') {
            when {
                not { buildingTag() }
            }
            steps {
                echo '🔨 Compilando e testando...'
                dir('catalogo-backend') {
                    sh 'chmod +x mvnw'
                    sh './mvnw clean test'
                }
            }
        }
        
        stage('Deploy') {
            when {
                buildingTag()
            }
            steps {
                echo '🚀 Fazendo deploy...'
                dir('catalogo-backend') {
                    sh './mvnw clean package -DskipTests'
                    sh "docker build -t ${DOCKER_IMAGE}:latest ."
                }
                sh 'docker-compose -f docker-compose.prod.yml down || true'
                sh 'docker-compose -f docker-compose.prod.yml up -d'
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline executado com sucesso!'
        }
        failure {
            echo '❌ Pipeline falhou!'
        }
    }
}