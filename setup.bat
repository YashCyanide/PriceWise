@echo off
REM PriceWise - Automated Setup Script for Windows
REM This script automates the setup process for the PriceWise application

setlocal enabledelayedexpansion

echo.
echo ========================================
echo    PriceWise - Automated Setup
echo    Amazon Price Tracker
echo ========================================
echo.

REM Check Node.js installation
echo [1/6] Checking Node.js installation...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    echo Minimum required version: 18.17.0
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Found Node.js %NODE_VERSION%

REM Check npm installation
echo.
echo [2/6] Checking npm installation...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] Found npm v%NPM_VERSION%

REM Check Git installation
echo.
echo [3/6] Checking Git installation...
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Git is not installed
    echo Some features may not work. Install from https://git-scm.com/
) else (
    for /f "tokens=3" %%i in ('git --version') do set GIT_VERSION=%%i
    echo [OK] Found Git version !GIT_VERSION!
)

REM Install dependencies
echo.
echo [4/6] Installing project dependencies...
if not exist package.json (
    echo [ERROR] package.json not found. Are you in the correct directory?
    pause
    exit /b 1
)

echo Running npm install...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed successfully

REM Setup environment file
echo.
echo [5/6] Setting up environment variables...
if exist .env (
    echo [WARNING] .env file already exists
    set /p OVERWRITE="Do you want to overwrite it? (y/N): "
    if /i not "!OVERWRITE!"=="y" (
        echo [INFO] Skipping .env setup
        goto :verify_env
    )
)

if exist .env.example (
    copy .env.example .env >nul
    echo [OK] Created .env file from .env.example
) else (
    echo # MongoDB Configuration > .env
    echo MONGODB_URI= >> .env
    echo. >> .env
    echo # BrightData Proxy Configuration >> .env
    echo BRIGHT_DATA_USERNAME= >> .env
    echo BRIGHT_DATA_PASSWORD= >> .env
    echo. >> .env
    echo # Email Configuration >> .env
    echo EMAIL_USER= >> .env
    echo EMAIL_PASSWORD= >> .env
    echo. >> .env
    echo # Optional: Hugging Face Token >> .env
    echo HF_TOKEN= >> .env
    echo [OK] Created .env file template
)

echo [WARNING] Please edit .env file and add your credentials
echo Required: MONGODB_URI, BRIGHT_DATA_USERNAME, BRIGHT_DATA_PASSWORD, EMAIL_USER, EMAIL_PASSWORD

:verify_env
REM Verify environment variables
echo.
echo [6/6] Verifying environment configuration...
if not exist .env (
    echo [ERROR] .env file not found
    goto :next_steps
)

findstr /C:"MONGODB_URI=" .env | findstr /V "MONGODB_URI=$" >nul
if %errorlevel% equ 0 (
    echo [OK] MONGODB_URI is set
) else (
    echo [ERROR] MONGODB_URI is not set
)

findstr /C:"BRIGHT_DATA_USERNAME=" .env | findstr /V "BRIGHT_DATA_USERNAME=$" >nul
if %errorlevel% equ 0 (
    echo [OK] BRIGHT_DATA_USERNAME is set
) else (
    echo [ERROR] BRIGHT_DATA_USERNAME is not set
)

findstr /C:"BRIGHT_DATA_PASSWORD=" .env | findstr /V "BRIGHT_DATA_PASSWORD=$" >nul
if %errorlevel% equ 0 (
    echo [OK] BRIGHT_DATA_PASSWORD is set
) else (
    echo [ERROR] BRIGHT_DATA_PASSWORD is not set
)

findstr /C:"EMAIL_USER=" .env | findstr /V "EMAIL_USER=$" >nul
if %errorlevel% equ 0 (
    echo [OK] EMAIL_USER is set
) else (
    echo [ERROR] EMAIL_USER is not set
)

findstr /C:"EMAIL_PASSWORD=" .env | findstr /V "EMAIL_PASSWORD=$" >nul
if %errorlevel% equ 0 (
    echo [OK] EMAIL_PASSWORD is set
) else (
    echo [ERROR] EMAIL_PASSWORD is not set
)

:next_steps
REM Print next steps
echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Your PriceWise application is ready!
echo.
echo Next steps:
echo   1. Edit .env file with your credentials (if not done already)
echo      Required: MONGODB_URI, BRIGHT_DATA credentials, EMAIL credentials
echo.
echo   2. Start development server:
echo      npm run dev
echo.
echo   3. Open your browser:
echo      http://localhost:3000
echo.
echo   4. Test the application:
echo      - Paste an Amazon product URL
echo      - Click 'Track' to start tracking
echo      - Check your email for notifications
echo.
echo For detailed setup instructions, see: LOCAL_SETUP.md
echo.
echo Happy tracking! 🚀
echo.

pause
