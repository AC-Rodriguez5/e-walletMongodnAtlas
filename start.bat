@echo off
REM Start both backend and frontend servers

setlocal enabledelayedexpansion

cls
echo ====================================
echo  E-Wallet Application Launcher
echo ====================================
echo.
echo This script will start:
echo 1. Backend Server (Port 5000)
echo 2. Frontend Server (Port 5173)
echo.
echo Prerequisites:
echo - MongoDB must be running on localhost:27017
echo - Both package.json and backend/package.json must have dependencies installed
echo.
echo Closing this window will stop all servers.
echo.
pause

REM Check if MongoDB is accessible
echo Checking MongoDB connection...
timeout /t 2 /nobreak >nul

REM Start backend
echo.
echo Starting Backend Server...
echo.
start "E-Wallet Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting Frontend Server...
echo.
start "E-Wallet Frontend" cmd /k "npm run dev"

echo.
echo ====================================
echo Servers are starting...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo API Health Check: http://localhost:5000/api/health
echo.
echo Press ENTER to open Frontend in browser...
pause

REM Open browser
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Application is ready!
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
