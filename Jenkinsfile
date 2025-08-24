pipeline {
    agent any
    
    parameters {
        string(
            name: 'GIT_URL',
            defaultValue: 'git@github.com:nightwish2016/kevin-kong-automation-testing.git',
            description: 'Git repository URL'
        )
        string(
            name: 'GIT_BRANCH',
            defaultValue: 'main',
            description: 'Git branch to checkout'
        )
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'staging', 'production'],
            description: 'Target environment for testing'
        )
        booleanParam(
            name: 'CLEANUP_AFTER_TEST',
            defaultValue: true,
            description: 'Clean up Docker containers after test completion'
        )
    }
    
    environment {
        NODE_VERSION = '18'
        DOCKER_BUILDKIT = '1'
        COMPOSE_DOCKER_CLI_BUILD = '1'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "Cloning repository: ${params.GIT_URL}"
                echo "Branch: ${params.GIT_BRANCH}"
                
                deleteDir()
                
                // Use SCM checkout with parameters
                checkout([$class: 'GitSCM', 
                    branches: [[name: "${params.GIT_BRANCH}"]], 
                    userRemoteConfigs: [[credentialsId: 'my ssh', url: "${params.GIT_URL}"]]])
                
                // Use a Windows command like 'dir'
                bat 'dir'
                bat 'git status'
            }
        }

         stage('Pre-test Cleanup') {
            steps {
                script {
                    echo "Cleaning up any existing Docker containers"
                    // Clean up any existing containers
                    bat 'npm run docker:down || exit 0'
                    bat 'rmdir /S /Q mochawesome-report || exit 0'
                }
            }
        }
        
        stage('Setup Environment') {
            steps {
                echo "Setting up Node.js ${NODE_VERSION} environment"
                
                // Use 'bat' for npm commands
                bat 'npm install'
                
                // Verify Docker is available
                bat 'docker --version'
                bat 'docker-compose --version'
            }
        }

         stage('Run Kong Automation Tests') {
            steps {
                script {
                    echo "Starting Kong automation tests"
                    try {
                        // Run tests with Docker setup and mochawesome reporting (disable colors for Jenkins)
                       // bat 'set NO_COLOR=1 && npm run test:service:ci'
                        bat 'set NO_COLOR=1 && npm run test:ci'
                    } catch (Exception e) {
                        currentBuild.result = 'UNSTABLE'
                        echo "Tests failed or were unstable: ${e.getMessage()}"
                    }
                }
            }
            post {
                always {
                    script {
                        // Collect Docker logs BEFORE stopping containers
                        bat 'docker-compose logs --no-color > docker-logs.txt 2>&1 || echo "No logs available" > docker-logs.txt'
                        
                        // Also collect individual container logs
                        bat 'docker logs kong-cp > kong-cp-logs.txt 2>&1 || echo "Kong CP logs not available" > kong-cp-logs.txt'
                        bat 'docker logs kong-ee-database > kong-db-logs.txt 2>&1 || echo "Kong DB logs not available" > kong-db-logs.txt'
                        
                        // Ensure Docker containers are stopped even if tests fail
                        bat 'npm run docker:down || true'
                    }
                }
            }
        }

         stage('Generate Test Reports') {
            steps {
                script {
                    echo "Processing test reports"
                    // Generate consolidated mochawesome report
                    bat 'npm run report:generate:ci || exit 0'                  
                }
            }
        }
        
        stage('Archive Results') {
            steps {
                script {
                    echo "Archiving test results and reports"
                    
                    // Archive test artifacts
                    archiveArtifacts artifacts: 'mochawesome-report/**/*', 
                                   fingerprint: true, 
                                   allowEmptyArchive: true
                    
                   // Archive Docker logs for debugging
                    archiveArtifacts artifacts: '*.txt', 
                                   fingerprint: true, 
                                   allowEmptyArchive: true
                    
                    // Archive screenshots if any test failures occurred
                    archiveArtifacts artifacts: 'cypress/screenshots/**/*', 
                                   fingerprint: true, 
                                   allowEmptyArchive: true
                }
            }
        }
    }
    
    post {
        always {
            script {
                // Publish HTML reports
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'mochawesome-report/mochawesome-report',
                    reportFiles: 'merged-report.html',
                    reportName: 'Kong Automation Test Report',
                    reportTitles: 'Kong Test Results',
                    escapeUnderscores: false,
                    includes: '**/*'
                ])
                
                echo "Pipeline completed for environment: ${params.ENVIRONMENT}"
            }
        }
        
        success {
            script {
                echo "✅ Kong automation tests completed successfully"
            }
        }
        
        failure {
            script {
                echo "❌ Kong automation tests failed"
            }
        }
        
        unstable {
            script {
                echo "⚠️ Kong automation tests completed with some failures"
            }
        }

         cleanup {
            script {
                if (params.CLEANUP_AFTER_TEST) {
                    echo "Performing final cleanup"
                    bat 'npm run docker:down || exit 0'
                    bat 'docker system prune -f || exit 0'
                }
            }
        }
    }
}