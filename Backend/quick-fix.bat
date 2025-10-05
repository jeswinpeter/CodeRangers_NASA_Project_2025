@echo off
echo 🔧 QUICK FIX: Installing minimal requirements only...
echo.
echo This will install only the essential packages needed to run the app.
echo.

cd /d "%~dp0"

echo Installing minimal requirements...
pip install fastapi uvicorn requests python-dotenv

echo.
echo ✅ Minimal installation complete!
echo.
echo Now try running the backend:
echo   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
echo.
pause