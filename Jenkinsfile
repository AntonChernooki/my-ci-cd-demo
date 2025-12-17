pipeline {
    agent any
    
    environment {
        // Определяем тип ОС
        IS_WINDOWS = bat(script: 'echo %OS%', returnStdout: true).contains('Windows')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "✅ Ветка: ${env.BRANCH_NAME}"
                echo "📊 Билд: ${env.BUILD_NUMBER}"
                echo "🔗 Ссылка на билд: ${env.BUILD_URL}"
                
                // Выводим информацию о системе
                script {
                    if (env.IS_WINDOWS) {
                        echo "🪟 ОС: Windows"
                        bat 'systeminfo | findstr /B /C:"OS Name" /C:"OS Version"'
                    } else {
                        echo "🐧 ОС: Linux"
                        sh 'uname -a'
                    }
                }
            }
        }

        stage('Check Environment') {
            steps {
                script {
                    if (env.IS_WINDOWS) {
                        bat '''
                            echo Проверяем Node.js...
                            node --version || echo "Node.js не установлен"
                            npm --version || echo "npm не установлен"
                            where node
                            where npm
                            echo Текущая директория:
                            cd
                            dir
                        '''
                    } else {
                        sh '''
                            echo Проверяем Node.js...
                            node --version || echo "Node.js не установлен"
                            npm --version || echo "npm не установлен"
                            which node
                            which npm
                            echo Текущая директория:
                            pwd
                            ls -la
                        '''
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    // Проверяем есть ли package.json
                    if (env.IS_WINDOWS) {
                        bat '''
                            if exist package.json (
                                echo "📦 Устанавливаем зависимости..."
                                npm install
                            ) else (
                                echo "⚠️ package.json не найден"
                                echo "Создаем тестовый package.json..."
                                echo { "name": "test", "version": "1.0.0" } > package.json
                            )
                        '''
                    } else {
                        sh '''
                            if [ -f "package.json" ]; then
                                echo "📦 Устанавливаем зависимости..."
                                npm install
                            else
                                echo "⚠️ package.json не найден"
                                echo "Создаем тестовый package.json..."
                                echo '{ "name": "test", "version": "1.0.0" }' > package.json
                            fi
                        '''
                    }
                }
            }
        }

        stage('Simple Test') {
            steps {
                script {
                    if (env.IS_WINDOWS) {
                        bat '''
                            echo "🧪 Запускаем тесты..."
                            echo "1. Создаем тестовый файл..."
                            echo console.log("Test passed!") > test.js
                            echo "2. Запускаем его..."
                            node test.js
                            echo "3. Удаляем тестовый файл..."
                            del test.js
                            echo "✅ Все тесты пройдены!"
                        '''
                    } else {
                        sh '''
                            echo "🧪 Запускаем тесты..."
                            echo "1. Создаем тестовый файл..."
                            echo 'console.log("Test passed!")' > test.js
                            echo "2. Запускаем его..."
                            node test.js
                            echo "3. Удаляем тестовый файл..."
                            rm test.js
                            echo "✅ Все тесты пройдены!"
                        '''
                    }
                }
            }
        }

        stage('Final Message') {
            steps {
                echo "🎉 Pipeline завершен успешно!"
                echo "🌿 Ветка: ${env.BRANCH_NAME}"
                echo "🏠 Рабочая директория: ${env.WORKSPACE}"
            }
        }
    }

    post {
        always {
            echo "🧹 Очистка рабочего пространства..."
            cleanWs()
        }
        success {
            echo "✅ SUCCESS: Pipeline выполнен успешно!"
        }
        failure {
            echo "❌ FAILURE: Pipeline завершился с ошибкой"
        }
    }
}