pipeline {
    agent any
    
    parameters {
        string(name: 'DEPLOY_TAG', defaultValue: '', description: 'Tag para deploy manual (opcional)')
    }
    
    environment {
        DOCKER_IMAGE = 'catalogo-backend'
    }
    
    triggers {
        // Trigger automático no push para main
        pollSCM('H/5 * * * *') // Verifica a cada 5 minutos
    }
    
    stages {
        stage('Build & Test') {
            // Sempre executa build & test (main pushes e tags)
            steps {
                echo "Building and testing..."
                echo "Branch: ${env.GIT_BRANCH}"
                echo "Build Cause: ${currentBuild.getBuildCauses()}"
                
                dir('catalogo-backend') {
                    sh 'chmod +x mvnw'
                    sh './mvnw clean test'
                }
            }
        }
        
        stage('Deploy') {
            when {
                anyOf {
                    // Deploy automático quando for tag
                    buildingTag()
                    
                    // Deploy manual com parâmetro
                    expression { return params.DEPLOY_TAG != null && params.DEPLOY_TAG != '' }
                }
            }
            steps {
                script {
                    def deployTag = params.DEPLOY_TAG ?: env.TAG_NAME ?: 'latest'
                    
                    if (buildingTag()) {
                        echo "🚀 Deploy AUTOMÁTICO da tag: ${env.TAG_NAME}"
                    } else if (params.DEPLOY_TAG) {
                        echo "🚀 Deploy MANUAL da versão: ${deployTag}"
                    }
                    
                    echo "Fazendo build da aplicação..."
                    dir('catalogo-backend') {
                        sh './mvnw clean package -DskipTests'
                    }
                    
                    echo "Executando deploy da versão: ${deployTag}"
                    sh "./deploy.sh ${deployTag}"
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}