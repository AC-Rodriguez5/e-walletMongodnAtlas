@echo off
REM E-Wallet Project - Automatic Setup Script for Windows

setlocal enabledelayedexpansion

cls
echo ====================================
echo  E-Wallet Application Setup
echo ====================================
echo.

REM Check if Node.js is installed
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed: 
node --version
echo.

REM Check if MongoDB is running
echo [2/6] Checking MongoDB connection...
timeout /t 1 /nobreak >nul
echo Attempting to connect to MongoDB at localhost:27017...
echo If this fails, please:
echo 1. Install MongoDB from: https://www.mongodb.com/try/download/community
echo 2. Start MongoDB service
echo.

REM Install backend dependencies
echo [3/6] Installing backend dependencies...
cd backend
if not exist node_modules (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✓ Backend dependencies already installed
)
echo.

REM Create .env file if it doesn't exist
echo [4/6] Checking backend configuration...
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo.
    echo ⚠ IMPORTANT: Edit backend\.env with your Gmail credentials:
    echo 1. Go to https://myaccount.google.com/apppasswords
    echo 2. Enable 2FA on your Google account first
    echo 3. Generate an App Password for "Mail"
    echo 4. Copy the 16-character password to GMAIL_APP_PASSWORD in .env
    echo 5. Set GMAIL_USER to your Gmail address
    echo.
    pause
) else (
    echo ✓ .env file exists
)
cd ..
echo.

REM Install frontend dependencies
echo [5/6] Installing frontend dependencies...
if not exist node_modules (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✓ Frontend dependencies already installed
)
echo.

REM Summary
echo [6/6] Setup Complete!
echo.
echo ====================================
echo  NEXT STEPS
echo ====================================
echo.
echo 1. Edit backend\.env with your Gmail credentials
echo.
echo 2. Start MongoDB (if not already running):
echo    Open Command Prompt and run:
echo    "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
echo.
echo 3. Start Backend Server in Terminal 1:
echo    cd backend
echo    npm run dev
echo.
echo 4. Start Frontend Server in Terminal 2:
echo    npm run dev
echo.
echo 5. Open browser and go to:
echo    http://localhost:5173
echo.
echo 6. For detailed instructions, see LAUNCH_GUIDE.md
echo.
echo ====================================
echo  TESTING THE APPLICATION
echo ====================================
echo.
echo Sign Up Test:
echo   - Email: test@example.com (use your real Gmail)
echo   - Password: Test12345 (min 8 chars)
echo   - Check Gmail inbox for OTP code
echo.
echo Login Test:
echo   - Use the same email and password
echo   - Verify with OTP code from email
echo.
echo Security Settings:
echo   - Toggle 2FA on/off
echo   - Change auth method (Email/SMS)
echo   - Update phone number
echo.
echo Wallet Features:
echo   - Add Money
echo   - Manage Cards
echo   - View Transactions
echo.
pause
