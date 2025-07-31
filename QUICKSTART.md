# Quick Start Guide for Dental API

## Current Issue: Docker Desktop Not Running

The error you're seeing indicates that Docker Desktop is not running. Here are the solutions:

### Option 1: Fix Docker Desktop (Recommended)

1. **Start Docker Desktop:**
   - Open Docker Desktop from the Start menu
   - Wait for it to fully start (Docker icon in system tray should be green)
   - Or run the PowerShell setup script: `.\setup.ps1`

2. **Once Docker Desktop is running:**
   ```powershell
   docker-compose up --build
   ```

### Option 2: Run Locally (Alternative)

If you want to run without Docker:

1. **Install MongoDB locally:**
   - Download from: https://www.mongodb.com/try/download/community
   - Start MongoDB service

2. **Update environment:**
   - The `.env` file is already configured for local MongoDB

3. **Start the API:**
   ```powershell
   npm start
   ```

### Option 3: Use Cloud MongoDB (Quick Test)

1. **Sign up for MongoDB Atlas (free):**
   - Go to: https://www.mongodb.com/atlas
   - Create a free cluster

2. **Update `.env` file:**
   ```
   MONGODB_URI=your-atlas-connection-string
   ```

3. **Start the API:**
   ```powershell
   npm start
   ```

## Testing the API

Once running, test these endpoints:
- **Health Check:** http://localhost:3000/health
- **API Root:** http://localhost:3000/
- **API Endpoint:** http://localhost:3000/api

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `.\setup.ps1` - Automated setup script (PowerShell)
- `setup.bat` - Automated setup script (Batch)

## Troubleshooting

**Docker Issues:**
- Ensure Docker Desktop is installed and running
- Try restarting Docker Desktop
- Check Windows Hyper-V is enabled

**MongoDB Issues:**
- For local MongoDB, ensure the service is running
- Check MongoDB logs for connection issues
- Verify the connection string in `.env`
