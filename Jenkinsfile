pipeline {
    agent any
    
    environment {
        APP_NAME = 'ci-cd-demo'
        DOCKER_HUB = 'your-dockerhub-username'
        NODE_ENV = 'production'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "📦 Repository: ${env.GIT_URL}"
                echo "🌿 Branch: ${env.GIT_BRANCH}"
                
                script {
                    def commit = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    currentBuild.displayName = "#${BUILD_NUMBER}-${commit}"
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh '''
                    echo "📥 Installing dependencies..."
                    npm ci
                '''
            }
        }
        
        stage('Code Quality') {
            steps {
                sh '''
                    echo "🔍 Running ESLint..."
                    npm run lint || echo "Linting completed"
                    
                    echo "💅 Checking code formatting..."
                    npm run format || echo "Formatting check completed"
                '''
            }
        }
        
        stage('Tests') {
            steps {
                sh '''
                    echo "🧪 Running tests..."
                    npm test
                '''
                
                // Публикация результатов тестов
                junit '**/test-results.xml'
                
                // Публикация отчетов о покрытии
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'coverage/lcov-report',
                    reportFiles: 'index.html',
                    reportName: 'Coverage Report'
                ])
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    def tag = "${env.BUILD_NUMBER}"
                    def imageName = "${env.DOCKER_HUB}/${env.APP_NAME}:${tag}"
                    
                    echo "🐳 Building Docker image: ${imageName}"
                    
                    sh """
                        docker build -t ${imageName} .
                        docker images | grep ${env.APP_NAME}
                    """
                    
                    // Сохраняем имя образа
                    env.DOCKER_IMAGE = imageName
                }
            }
        }
        
        stage('Push to Docker Hub') {
            when {
                branch 'main'
            }
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'docker-hub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh """
                            echo "🔐 Logging into Docker Hub..."
                            echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin
                            
                            echo "📤 Pushing image to Docker Hub..."
                            docker push ${env.DOCKER_IMAGE}
                            
                            # Также пушим тег latest
                            docker tag ${env.DOCKER_IMAGE} ${env.DOCKER_HUB}/${env.APP_NAME}:latest
                            docker push ${env.DOCKER_HUB}/${env.APP_NAME}:latest
                        """
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo "🚀 Deploying application..."
                
                // Простой деплой через SSH (пример)
                sshagent(['deploy-ssh-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no deploy@your-server.com \
                        "cd /var/www/ci-cd-demo && \
                         docker pull ${DOCKER_IMAGE} && \
                         docker-compose up -d"
                    '''
                }
                
                echo "✅ Deployment completed!"
            }
        }
        
        stage('Health Check') {
            steps {
                retry(3) {
                    sh '''
                        echo "🏥 Performing health check..."
                        sleep 10  # Даем время приложению запуститься
                        
                        # Проверяем health endpoint
                        curl -f http://your-server.com:3000/health || exit 1
                        echo "✅ Application is healthy!"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo "🧹 Cleaning up workspace..."
            cleanWs()
        }
        
        success {
            echo "🎉 Pipeline completed successfully!"
            
            // Отправка уведомления в Slack (опционально)
            slackSend(
                color: 'good',
                message: "✅ *${env.JOB_NAME}* build #${env.BUILD_NUMBER} succeeded!"
            )
        }
        
        failure {
            echo "❌ Pipeline failed!"
            
            slackSend(
                color: 'danger',
                message: "❌ *${env.JOB_NAME}* build #${env.BUILD_NUMBER} failed!"
            )
        }
        
        changed {
            echo "Pipeline status changed!"
        }
    }
}