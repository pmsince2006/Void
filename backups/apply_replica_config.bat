@echo off
:: Test if running with Administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Elevating privileges via Windows UAC...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ========================================================
echo Applying VOID MongoDB Replica Set Configuration (rs0)...
echo ========================================================
echo.
echo 1. Copying validated mongod_replica.cfg to MongoDB bin folder...
copy /Y "D:\Projects\Void\backups\mongod_replica.cfg" "C:\Program Files\MongoDB\Server\8.2\bin\mongod.cfg"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to copy config file.
    pause
    exit /b %errorlevel%
)

echo.
echo 2. Restarting MongoDB Windows Service...
net stop MongoDB
net start MongoDB

echo.
echo ========================================================
echo Configuration applied and service restarted successfully!
echo ========================================================
timeout /t 5
