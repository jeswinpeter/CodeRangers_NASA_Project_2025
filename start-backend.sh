#!/bin/bash
# Start Backend Server

echo "🚀 Starting NASA Weather Intelligence Backend..."

# Kill any existing backend processes
echo "Stopping any existing backend processes..."
pkill -f "uvicorn.*main:app" 2>/dev/null || true

# Wait a moment
sleep 2

# Navigate to backend directory
cd /Users/vasudev/Nasa_project_2025_V1/Backend

# Set PYTHONPATH and start server
echo "Starting backend server on port 8002..."
PYTHONPATH=/Users/vasudev/Nasa_project_2025_V1/Backend \
/Users/vasudev/Nasa_project_2025_V1/Backend/venv/bin/python \
-m uvicorn main:app --reload --host 0.0.0.0 --port 8002