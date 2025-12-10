pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'catalogo-backend'
    }
    
    triggers {
        // Trigger automático no push para main
        pollSCM('* * * * *') // Verifica a cada 1 minuto
    }
    
    stages {
        stage('Build & Test') {
            steps {
                echo "🔨 Building and testing..."
                echo "Branch: ${env.GIT_BRANCH}"
                echo "Commit: ${env.GIT_COMMIT}"
                
                dir('catalogo-backend') {
                    sh 'chmod +x mvnw'
                    sh './mvnw clean test'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    echo "🚀 Fazendo build da aplicação..."
                    dir('catalogo-backend') {
                        sh './mvnw clean package -DskipTests'
                    }
                    
                    echo ">>> Building backend Docker image..."
                    dir('catalogo-backend') {
                        sh 'docker build -t catalogo-backend:latest -f Dockerfile .'
                    }
                    
                    echo ">>> Building frontend Docker image..."
                    dir('catalogo-frontend') {
                        sh 'docker build -t catalogo-frontend:latest -f Dockerfile .'
                    }
                    
                    echo ">>> Starting new version..."
                    sh 'export DB_PASSWORD=postgres123'
                    sh 'docker-compose up -d --remove-orphans'
                    
                    echo ">>> Waiting for application to start..."
                    sleep 30
                    
                    // Verifica se os containers estão rodando
                    sh 'docker ps | grep catalogo'
                    
                    echo ""
                    echo "✅ ==== DEPLOY SUCCESS ===="
                    echo "🌐 Frontend available at: http://localhost:3000"
                    echo "🔥 Backend API available at: http://localhost:8081"
                    echo "💚 Health check: http://localhost:8081/actuator/health"
                    echo "📊 Admin login: admin@catalogo.com / admin123"
                    echo "👤 Client login: cliente@catalogo.com / cliente123"
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