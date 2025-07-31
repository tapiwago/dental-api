# Dental API Setup Script
Write-Host "Starting Dental API Setup..." -ForegroundColor Green
Write-Host ""

# Check if MongoDB is running locally
$mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue

if ($mongoProcess) {
    Write-Host "✓ MongoDB is running locally" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting the API server..." -ForegroundColor Yellow
    npm start
} else {
    Write-Host "✗ MongoDB is not running locally" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please choose an option:" -ForegroundColor Yellow
    Write-Host "1. Install and start MongoDB locally"
    Write-Host "2. Use Docker to run both API and MongoDB"
    Write-Host "3. Exit"
    Write-Host ""
    
    $choice = Read-Host "Enter your choice (1-3)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "Please install MongoDB Community Edition from:" -ForegroundColor Yellow
            Write-Host "https://www.mongodb.com/try/download/community" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "After installation, start MongoDB service and run this script again."
            Read-Host "Press Enter to continue"
        }
        "2" {
            Write-Host ""
            Write-Host "Checking Docker Desktop status..." -ForegroundColor Yellow
            
            # Try to start Docker Desktop
            try {
                $dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
                if (-not $dockerProcess) {
                    Write-Host "Starting Docker Desktop..." -ForegroundColor Yellow
                    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
                    Write-Host "Waiting for Docker Desktop to start (30 seconds)..." -ForegroundColor Yellow
                    Start-Sleep -Seconds 30
                }
                
                Write-Host "Testing Docker connection..." -ForegroundColor Yellow
                $dockerTest = docker info 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✓ Docker is ready!" -ForegroundColor Green
                    Write-Host "Starting containers..." -ForegroundColor Yellow
                    docker-compose up --build
                } else {
                    Write-Host "✗ Docker is not ready yet." -ForegroundColor Red
                    Write-Host "Please wait for Docker Desktop to fully start, then run:" -ForegroundColor Yellow
                    Write-Host "docker-compose up --build" -ForegroundColor Cyan
                }
            }
            catch {
                Write-Host "Error starting Docker Desktop. Please start it manually." -ForegroundColor Red
            }
        }
        "3" {
            Write-Host "Exiting..." -ForegroundColor Yellow
            exit
        }
        default {
            Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
        }
    }
}
