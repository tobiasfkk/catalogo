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
                echo '🚀 Fazendo deploy da versão ${env.TAG_NAME}...'
                dir('catalogo-backend') {
                    sh './mvnw clean package -DskipTests'
                }
                script {
                    // Executar script de deploy
                    sh "./deploy.sh ${env.TAG_NAME}"
                }
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