@echo off
REM Student Notes Marketplace - Start Services
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Student Notes Marketplace
echo   Starting Services
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    pause
    exit /b 1
)

echo [OK] Node.js is installed
echo.

REM Main Website (Port 8000)
echo Starting Main Website...
echo Location: StudentNotesMarketplace 6
echo Port: 8000
echo URL: http://localhost:8000
echo.

cd /d "%~dp0"

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies for main website...
    call npm install
)

REM Start main website in new window
start "Main Website (Port 8000)" cmd /k npm run dev

echo [OK] Main website started
echo.

REM Wait a bit for main website to start
timeout /t 3 /nobreak

REM Admin Panel (Port 3000)
echo Starting Admin Panel...
echo Location: /Users/prithviraj/admin masterstudents
echo Port: 3000
echo URL: http://localhost:3000
echo.

cd /d "C:\Users\prithviraj\admin masterstudents"

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies for admin panel...
    call npm install
)

REM Start admin panel in new window
start "Admin Panel (Port 3000)" cmd /k npm run dev

echo [OK] Admin panel started
echo.

echo ========================================
echo [OK] All services are running!
echo ========================================
echo.
echo Access Points:
echo   Main Website:    http://localhost:8000
echo   Admin Panel:     http://localhost:3000
echo.
echo Admin Login Credentials:
echo   Email:    admin@studentnotes.com
echo   Password: admin123
echo.
echo Database: SQLite (shared between services)
echo.
echo To stop all services, close the command windows
echo.

pause
