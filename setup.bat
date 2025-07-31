@echo off
echo Starting Dental API Setup...
echo.

echo Step 1: Checking if MongoDB is running locally...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✓ MongoDB is running locally
    echo.
    echo Starting the API server...
    npm start
) else (
    echo ✗ MongoDB is not running locally
    echo.
    echo Please choose an option:
    echo 1. Install and start MongoDB locally
    echo 2. Use Docker to run both API and MongoDB
    echo 3. Exit
    echo.
    set /p choice="Enter your choice (1-3): "
    
    if "!choice!"=="1" (
        echo.
        echo Please install MongoDB Community Edition from:
        echo https://www.mongodb.com/try/download/community
        echo.
        echo After installation, start MongoDB service and run this script again.
        pause
    ) else if "!choice!"=="2" (
        echo.
        echo Starting Docker Desktop if not running...
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        echo.
        echo Please wait for Docker Desktop to start, then run:
        echo docker-compose up --build
        pause
    ) else (
        echo Exiting...
    )
)
