#!/bin/bash
# Frontend Restart Script for NASA Weather Intelligence

echo "🌤️ Restarting NASA Weather Intelligence Frontend..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Navigate to frontend directory
cd /Users/vasudev/Nasa_project_2025_V1/Dashboard

# Kill existing processes
echo -e "${YELLOW}Stopping existing frontend processes...${NC}"
pkill -f "vite" 2>/dev/null
pkill -f "npm.*dev" 2>/dev/null
sleep 2

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Node modules not found. Installing dependencies...${NC}"
    npm install
fi

# Start the frontend server
echo -e "${GREEN}Starting frontend development server...${NC}"
npm run dev

echo -e "${GREEN}Frontend server started!${NC}"