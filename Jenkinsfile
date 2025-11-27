pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'catalogo-backend'
        DOCKER_TAG = "${BUILD_NUMBER}"
        MAVEN_OPTS = '-Dmaven.test.failure.ignore=true'
        JAVA_HOME = '/opt/java/openjdk'
    }
    
    tools {
        maven 'Maven-3.9'
        jdk 'JDK-21'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                echo 'Building the application...'
                dir('catalogo-backend') {
                    sh 'mvn clean compile -DskipTests'
                }
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests...'
                dir('catalogo-backend') {
                    sh 'mvn test'
                }
            }
            post {
                always {
                    dir('catalogo-backend') {
                        junit 'target/surefire-reports/*.xml'
                        publishTestResults testResultsPattern: 'target/surefire-reports/*.xml'
                    }
                }
            }
        }
        
        stage('Code Quality Analysis') {
            parallel {
                stage('SonarQube Analysis') {
                    when {
                        anyOf {
                            branch 'main'
                            branch 'develop'
                        }
                    }
                    steps {
                        echo 'Running SonarQube analysis...'
                        dir('catalogo-backend') {
                            withSonarQubeEnv('SonarQube') {
                                sh 'mvn sonar:sonar'
                            }
                        }
                    }
                }
                
                stage('Security Scan') {
                    steps {
                        echo 'Running security scan...'
                        dir('catalogo-backend') {
                            sh 'mvn org.owasp:dependency-check-maven:check'
                        }
                    }
                }
            }
        }
        
        stage('Package') {
            steps {
                echo 'Packaging the application...'
                dir('catalogo-backend') {
                    sh 'mvn package -DskipTests'
                }
            }
            post {
                always {
                    dir('catalogo-backend') {
                        archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                script {
                    dir('catalogo-backend') {
                        def image = docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                        docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
                            image.push()
                            image.push('latest')
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Deploying to staging environment...'
                script {
                    sh """
                        docker-compose -f docker-compose.staging.yml down || true
                        docker-compose -f docker-compose.staging.yml pull
                        docker-compose -f docker-compose.staging.yml up -d
                    """
                }
            }
        }
        
        stage('Integration Tests') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Running integration tests...'
                script {
                    // Aguarda o serviço ficar disponível
                    sh 'sleep 30'
                    sh 'curl -f http://localhost:8081/actuator/health || exit 1'
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to production...'
                input message: 'Deploy to production?', ok: 'Deploy'
                script {
                    sh """
                        docker-compose -f docker-compose.prod.yml down || true
                        docker-compose -f docker-compose.prod.yml pull
                        docker-compose -f docker-compose.prod.yml up -d
                    """
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline finished!'
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded! 🎉'
            // Notificação de sucesso (Slack, email, etc.)
        }
        failure {
            echo 'Pipeline failed! ❌'
            // Notificação de falha
        }
        unstable {
            echo 'Pipeline unstable! ⚠️'
        }
    }
}