pipeline {
    agent any

    environment {
        BACKEND_DIR = "backend"
        FRONTEND_DIR = "frontend"
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo 'Cloning repository...'
                checkout scm
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir("${BACKEND_DIR}") {
                    bat 'npm install'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir("${FRONTEND_DIR}") {
                    bat 'npm install --legacy-peer-deps'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {
                    bat 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                bat 'docker build -t voting-backend ./backend'
                bat 'docker build -t voting-frontend ./frontend'
            }
        }

        stage('Run Containers') {
            steps {
                bat 'docker-compose up -d --build'
            }
        }
    }

    post {
        success {
            echo '🎉 Jenkins Pipeline SUCCESS - Voting System Running!'
        }

        failure {
            echo '❌ Jenkins Pipeline FAILED - Check logs'
        }
    }
}