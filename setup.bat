@echo off
REM Setup script for NASA Weather App (Windows)

echo 🚀 Setting up NASA Weather Intelligence Dashboard...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

echo ✅ Python and Node.js found!

REM Setup Backend
echo 📦 Setting up Backend...
cd Backend

REM Try core dependencies first
echo Installing core dependencies...
pip install -r requirements-core.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install core dependencies
    exit /b 1
)

REM Test if the app can start
echo Testing backend setup...
python -c "from app.main import app; print('✅ Backend setup successful!')"
if %errorlevel% neq 0 (
    echo ❌ Backend setup failed. Check error messages above.
    exit /b 1
)

cd ..

REM Setup Frontend
echo 📦 Setting up Frontend...
cd Dashboard
npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend setup failed. Check error messages above.
    exit /b 1
)

cd ..

echo 🎉 Setup complete!
echo.
echo To run the application:
echo 1. Backend:  cd Backend ^&^& uvicorn app.main:app --reload
echo 2. Frontend: cd Dashboard ^&^& npm run dev