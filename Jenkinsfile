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
                echo 'Building and testing...'
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
                    expression { return params.DEPLOY_TAG != null && params.DEPLOY_TAG != '' }
                    expression { 
                        // Verifica se há tags recentes para deploy
                        def result = sh(script: 'git tag --sort=-version:refname | head -1', returnStdout: true).trim()
                        return result != null && result != ''
                    }
                }
            }
            steps {
                echo 'Deploying version ${env.TAG_NAME}...'
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
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}