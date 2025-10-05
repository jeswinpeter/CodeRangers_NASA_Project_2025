#!/bin/bash
# Setup script for NASA Weather App

echo "🚀 Setting up NASA Weather Intelligence Dashboard..."

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Python and Node.js found!"

# Setup Backend
echo "📦 Setting up Backend..."
cd Backend

# Try core dependencies first
echo "Installing core dependencies..."
pip install -r requirements-core.txt

# Test if the app can start
echo "Testing backend setup..."
python -c "from app.main import app; print('✅ Backend setup successful!')" || {
    echo "❌ Backend setup failed. Check error messages above."
    exit 1
}

cd ..

# Setup Frontend
echo "📦 Setting up Frontend..."
cd Dashboard
npm install || {
    echo "❌ Frontend setup failed. Check error messages above."
    exit 1
}

cd ..

echo "🎉 Setup complete!"
echo ""
echo "To run the application:"
echo "1. Backend:  cd Backend && uvicorn app.main:app --reload"
echo "2. Frontend: cd Dashboard && npm run dev"