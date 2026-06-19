@echo off
title EventHub Full-Stack Starter
echo ==========================================================
echo               EventHub Full-Stack Starter
echo ==========================================================
echo.

:: Set Java Home for the backend
set "JAVA_HOME=C:\Users\jothi\.jdks\ms-21.0.10"

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found! Please make sure Node.js is installed.
    pause
    exit /b
)

:: Navigate to root directory of script
cd /d "%~dp0"

:: Start Spring Boot Backend in a separate window
echo [1/3] Launching Spring Boot Backend Server...
start "EventHub Backend" cmd /c "cd backend && mvnw spring-boot:run"

:: Wait for backend to boot up
echo Waiting 8 seconds for backend database to initialize...
timeout /t 8 /nobreak > nul

:: Start React Frontend in a separate window
echo [2/3] Launching React Frontend...
start "EventHub Frontend" cmd /c "cd frontend && npm run dev"

:: Wait for frontend to be ready
timeout /t 3 /nobreak > nul

:: Open Browser
echo [3/3] Opening Web Browser to http://localhost:5173...
start http://localhost:5173

echo.
echo ==========================================================
echo   Success! EventHub is running.
echo   - Close the "EventHub Backend" window to stop backend.
echo   - Close the "EventHub Frontend" window to stop website.
echo ==========================================================
echo.
pause
