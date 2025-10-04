#!/bin/bash
# Comprehensive troubleshooting script for NASA Weather Intelligence

echo "🔍 NASA Weather Intelligence - Connection Troubleshooter"
echo "======================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check if a port is in use
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $service is running on port $port${NC}"
        return 0
    else
        echo -e "${RED}❌ $service is NOT running on port $port${NC}"
        return 1
    fi
}

# Function to test API endpoint
test_api() {
    local url=$1
    local description=$2
    
    echo -e "${BLUE}Testing: $description${NC}"
    
    response=$(curl -s -w "%{http_code}" -o /tmp/api_response "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ API responded successfully${NC}"
        echo "Response preview:"
        head -3 /tmp/api_response | jq . 2>/dev/null || head -3 /tmp/api_response
        return 0
    else
        echo -e "${RED}❌ API request failed (HTTP: $response)${NC}"
        return 1
    fi
}

echo -e "${BLUE}1. Checking server status...${NC}"

# Check frontend
check_port 5174 "Frontend (Vite)"
frontend_running=$?

# Check backend
check_port 8002 "Backend (FastAPI)"
backend_running=$?

echo ""
echo -e "${BLUE}2. Testing API connectivity...${NC}"

if [ $backend_running -eq 0 ]; then
    # Test health endpoint
    test_api "http://localhost:8002/health" "Health check"
    
    # Test weather endpoint
    test_api "http://localhost:8002/api/weather/current?lat=40.7128&lon=-74.006" "Weather API"
else
    echo -e "${RED}❌ Cannot test API - backend is not running${NC}"
fi

echo ""
echo -e "${BLUE}3. Checking configuration...${NC}"

# Check Vite config
vite_config="/Users/vasudev/Nasa_project_2025_V1/Dashboard/vite.config.ts"
if grep -q "localhost:8002" "$vite_config"; then
    echo -e "${GREEN}✅ Vite proxy configured correctly (port 8002)${NC}"
else
    echo -e "${RED}❌ Vite proxy configuration issue${NC}"
    echo "Current proxy target:"
    grep -A 3 "target:" "$vite_config" || echo "Could not find proxy config"
fi

echo ""
echo -e "${BLUE}4. Network connectivity test...${NC}"

# Test localhost connectivity
if ping -c 1 localhost >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Localhost connectivity OK${NC}"
else
    echo -e "${RED}❌ Localhost connectivity issue${NC}"
fi

echo ""
echo -e "${YELLOW}=== DIAGNOSTIC SUMMARY ===${NC}"

if [ $frontend_running -eq 0 ] && [ $backend_running -eq 0 ]; then
    echo -e "${GREEN}✅ Both servers are running${NC}"
    echo -e "${BLUE}🌐 Frontend: http://localhost:5174${NC}"
    echo -e "${BLUE}🔧 Backend: http://localhost:8002${NC}"
    echo -e "${BLUE}📚 API Docs: http://localhost:8002/docs${NC}"
    
    echo ""
    echo -e "${YELLOW}If you're still getting 'Failed to fetch' errors:${NC}"
    echo "1. Clear browser cache (Cmd+Shift+R)"
    echo "2. Check browser console (F12) for detailed errors"
    echo "3. Try a different browser"
    echo "4. Restart both servers using the scripts"
    
elif [ $frontend_running -ne 0 ] && [ $backend_running -eq 0 ]; then
    echo -e "${RED}❌ Frontend is not running${NC}"
    echo -e "${YELLOW}Solution: Start frontend server${NC}"
    echo "cd /Users/vasudev/Nasa_project_2025_V1/Dashboard && npm run dev"
    
elif [ $frontend_running -eq 0 ] && [ $backend_running -ne 0 ]; then
    echo -e "${RED}❌ Backend is not running${NC}"
    echo -e "${YELLOW}Solution: Start backend server${NC}"
    echo "cd /Users/vasudev/Nasa_project_2025_V1/Backend"
    echo "PYTHONPATH=/Users/vasudev/Nasa_project_2025_V1/Backend /Users/vasudev/Nasa_project_2025_V1/Backend/venv/bin/python -m uvicorn main:app --reload --host 0.0.0.0 --port 8002"
    
else
    echo -e "${RED}❌ Both servers are not running${NC}"
    echo -e "${YELLOW}Solution: Start both servers${NC}"
    echo "Use: ./restart-all.sh"
fi

echo ""
echo -e "${BLUE}🚀 Quick restart commands:${NC}"
echo "Backend only:  ./Backend/restart-backend.sh"
echo "Frontend only: ./Dashboard/restart-frontend.sh" 
echo "Both servers:  ./restart-all.sh"

rm -f /tmp/api_response 2>/dev/null