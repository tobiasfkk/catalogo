pipeline {
    agent any
    
    parameters {
        string(name: 'DEPLOY_TAG', defaultValue: '', description: 'Tag para deploy (deixe vazio para builds normais)')
    }
    
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
                anyOf {
                    buildingTag()
                    expression { return env.GIT_BRANCH?.contains('refs/tags/') }
                    expression { return params.DEPLOY_TAG != null }
                }
            }
            steps {
                echo '🚀 Fazendo deploy da versão ${env.TAG_NAME}...'
                dir('catalogo-backend') {
                    sh './mvnw clean package -DskipTests'
                }
                script {
                    def deployTag = params.DEPLOY_TAG ?: env.TAG_NAME ?: 'latest'
                    echo "Deploy da versão: ${deployTag}"
                    sh "./deploy.sh ${deployTag}"
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