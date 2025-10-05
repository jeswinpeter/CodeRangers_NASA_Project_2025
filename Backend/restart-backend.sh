#!/bin/bash
# Backend Restart Script for NASA Weather Intelligence

echo "🛰️ Restarting NASA Weather Intelligence Backend..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Navigate to backend directory
cd /Users/vasudev/Nasa_project_2025_V1/Backend

# Kill existing processes
echo -e "${YELLOW}Stopping existing backend processes...${NC}"
pkill -f "uvicorn" 2>/dev/null
pkill -f "python.*main:app" 2>/dev/null
sleep 2

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}Virtual environment not found. Please run setup.sh first.${NC}"
    exit 1
fi

# Start the backend server
echo -e "${GREEN}Starting backend server on port 8002...${NC}"
PYTHONPATH=/Users/vasudev/Nasa_project_2025_V1/Backend /Users/vasudev/Nasa_project_2025_V1/Backend/venv/bin/python -m uvicorn main:app --reload --host 0.0.0.0 --port 8002

echo -e "${GREEN}Backend server started!${NC}"
echo "🌐 API available at: http://localhost:8002"
echo "📚 Documentation at: http://localhost:8002/docs"