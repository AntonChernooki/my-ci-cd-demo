pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS'
    }
    
    environment {
        // Разные переменные для разных веток
        DEPLOY_ENV = 'development'
        APP_NAME = 'my-ci-cd-demo'
    }
    
    parameters {
        choice(name: 'RUN_TESTS', choices: ['true', 'false'], description: 'Запускать тесты?')
        choice(name: 'BUILD_TYPE', choices: ['fast', 'full'], description: 'Тип сборки')
    }
    
    stages {
        stage('Checkout & Info') {
            steps {
                checkout scm
                
                script {
                    echo "🎯 Ветка: ${env.BRANCH_NAME}"
                    echo "📝 Коммит: ${env.GIT_COMMIT}"
                    
                    // Назначаем имя сборки
                    currentBuild.displayName = "${env.BRANCH_NAME}-#${BUILD_NUMBER}"
                    
                    // Определяем окружение по ветке
                    if (env.BRANCH_NAME == 'main') {
                        env.DEPLOY_ENV = 'production'
                    } else if (env.BRANCH_NAME == 'login' || env.BRANCH_NAME == 'payment' || env.BRANCH_NAME == 'profile') {
                        env.DEPLOY_ENV = 'staging'
                    } else {
                        env.DEPLOY_ENV = 'development'
                    }
                    
                    echo "🌍 Окружение: ${env.DEPLOY_ENV}"
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh '''
                    echo "📦 Установка зависимостей для ветки: ${BRANCH_NAME}"
                    npm ci
                '''
            }
        }
        
        stage('Run Tests') {
            when {
                expression { params.RUN_TESTS == 'true' }
            }
            steps {
                sh '''
                    echo "🧪 Запуск тестов..."
                    npm test || echo "Тесты завершились с ошибкой"
                '''
            }
        }
        
        stage('Branch-Specific Steps') {
            steps {
                script {
                    echo "🚀 Выполняем специфичные для ветки действия"
                    
                    switch(env.BRANCH_NAME) {
                        case 'login':
                            echo "🔐 Ветка login: проверка логики аутентификации"
                            sh '''
                                echo "Проверяем логику входа..."
                                # Можно запустить специфичные тесты
                                # npm run test:login
                            '''
                            break
                            
                        case 'payment':
                            echo "💳 Ветка payment: проверка платежной системы"
                            sh '''
                                echo "Тестируем платежный модуль..."
                                # npm run test:payment
                            '''
                            break
                            
                        case 'profile':
                            echo "👤 Ветка profile: работа с профилями пользователей"
                            sh '''
                                echo "Проверяем обновление профиля..."
                                # npm run test:profile
                            '''
                            break
                            
                        case 'main':
                            echo "🚀 Ветка main: подготовка к продакшену"
                            sh '''
                                echo "Сборка для продакшена..."
                                npm run build
                            '''
                            break
                            
                        default:
                            echo "🌿 Другая ветка: базовая проверка"
                    }
                }
            }
        }
        
        stage('Build & Package') {
            when {
                expression { env.BRANCH_NAME == 'main' || params.BUILD_TYPE == 'full' }
            }
            steps {
                sh '''
                    echo "🏗️  Сборка проекта..."
                    npm run build || echo "Нет скрипта build, пропускаем"
                    
                    echo "📦 Создание пакета..."
                    tar -czf ${APP_NAME}-${BRANCH_NAME}-${BUILD_NUMBER}.tar.gz build/ || echo "Нет build директории"
                '''
                
                // Сохраняем артефакты
                archiveArtifacts artifacts: '*.tar.gz', fingerprint: true
            }
        }
        
        stage('Deploy Preview') {
            when {
                expression { env.BRANCH_NAME in ['login', 'payment', 'profile'] }
            }
            steps {
                script {
                    echo "🚀 Деплой превью для ветки: ${env.BRANCH_NAME}"
                    
                    // Пример для Vercel/Netlify или собственного сервера
                    sh """
                        echo "Создаем превью для ветки ${BRANCH_NAME}"
                        echo "Превью будет доступно по адресу:"
                        echo "https://${BRANCH_NAME}-${APP_NAME}.yourdomain.com"
                    """
                }
            }
        }
        
        stage('Quality Gate') {
            when {
                expression { env.BRANCH_NAME == 'main' }
            }
            steps {
                script {
                    echo "🔍 Проверка качества кода перед мержем в main"
                    
                    // Проверяем покрытие тестами
                    sh '''
                        echo "Проверяем покрытие тестами..."
                        # npm run coverage
                    '''
                    
                    // Проверяем линтер
                    sh '''
                        echo "Проверяем код линтером..."
                        # npm run lint
                    '''
                    
                    // Запрашиваем подтверждение для мержа в main
                    if (env.BRANCH_NAME == 'main') {
                        input(
                            message: 'Подтвердите деплой в Production',
                            ok: 'Deploy',
                            submitter: 'admin'
                        )
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo "📊 Итоги выполнения для ветки: ${env.BRANCH_NAME}"
            echo "⏱️  Длительность: ${currentBuild.durationString}"
            
            // Очистка workspace
            cleanWs()
        }
        
        success {
            echo "✅ Сборка для ветки ${env.BRANCH_NAME} успешна!"
            
            // Уведомление в зависимости от ветки
            script {
                def message = "✅ *${env.JOB_NAME}* - ветка `${env.BRANCH_NAME}` собрана успешно (#${env.BUILD_NUMBER})"
                
                // Отправляем в Slack (пример)
                // slackSend(color: 'good', message: message)
                
                // Или email
                // emailext(
                //     subject: "SUCCESS: ${env.BRANCH_NAME} сборка #${env.BUILD_NUMBER}",
                //     body: "Сборка успешно завершена\nВетка: ${env.BRANCH_NAME}\nСсылка: ${env.BUILD_URL}",
                //     to: 'team@example.com'
                // )
            }
        }
        
        failure {
            echo "❌ Сборка для ветки ${env.BRANCH_NAME} упала!"
            
            script {
                def message = "❌ *${env.JOB_NAME}* - ветка `${env.BRANCH_NAME}` упала (#${env.BUILD_NUMBER})"
                // slackSend(color: 'danger', message: message)
            }
        }
        
        changed {
            echo "🔄 Статус сборки изменился"
        }
    }
}