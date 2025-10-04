#!/bin/bash
# Complete Restart Script for NASA Weather Intelligence

echo "🚀 Restarting Complete NASA Weather Intelligence System..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to run command in background and get PID
run_in_background() {
    local cmd="$1"
    local name="$2"
    
    echo -e "${BLUE}Starting $name...${NC}"
    eval "$cmd" &
    local pid=$!
    echo "PID: $pid"
    return $pid
}

# Kill existing processes
echo -e "${YELLOW}Stopping all existing processes...${NC}"
pkill -f "uvicorn" 2>/dev/null
pkill -f "python.*main:app" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "npm.*dev" 2>/dev/null
sleep 3

# Start Backend
echo -e "${GREEN}=== Starting Backend Server ===${NC}"
cd /Users/vasudev/Nasa_project_2025_V1/Backend
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Running setup..."
    ./setup.sh dev
fi

# Start backend in background
echo "Starting backend server on port 8002..."
PYTHONPATH=/Users/vasudev/Nasa_project_2025_V1/Backend /Users/vasudev/Nasa_project_2025_V1/Backend/venv/bin/python -m uvicorn main:app --reload --host 0.0.0.0 --port 8002 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 5

# Start Frontend
echo -e "${GREEN}=== Starting Frontend Server ===${NC}"
cd /Users/vasudev/Nasa_project_2025_V1/Dashboard

# Check dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend in background
echo "Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Show status
echo -e "${GREEN}=== System Status ===${NC}"
echo "✅ Backend running on: http://localhost:8002"
echo "✅ Frontend running on: http://localhost:5174 (or next available port)"
echo "📚 API Docs available at: http://localhost:8002/docs"
echo ""
echo "🔧 Process IDs:"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   or use: pkill -f 'uvicorn|vite'"
echo ""
echo "📊 Check server status with:"
echo "   curl http://localhost:8002/health"
echo ""
echo -e "${BLUE}🎉 NASA Weather Intelligence is now running!${NC}"

# Keep script running to show logs
wait