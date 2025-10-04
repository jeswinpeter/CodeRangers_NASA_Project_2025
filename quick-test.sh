#!/bin/bash
# Quick API Connection Test

echo "🔧 Quick API Connection Test"
echo "============================"

# Test backend directly
echo "1. Testing backend server..."
if curl -s http://localhost:8002/health >/dev/null 2>&1; then
    echo "✅ Backend is responding"
    
    # Test weather API
    echo "2. Testing weather API..."
    response=$(curl -s "http://localhost:8002/api/weather/current?lat=40.7128&lon=-74.006")
    if echo "$response" | grep -q "current\|lat\|lon"; then
        echo "✅ Weather API is working"
        echo "Sample response:"
        echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'Temperature: {data[\"current\"][\"ts\"]:.1f}°C, Humidity: {data[\"current\"][\"rh2m\"]:.1f}%')" 2>/dev/null || echo "$response" | head -1
    else
        echo "❌ Weather API returned unexpected response"
        echo "$response"
    fi
else
    echo "❌ Backend server is not responding on port 8002"
    echo ""
    echo "To start backend:"
    echo "cd /Users/vasudev/Nasa_project_2025_V1/Backend"
    echo "PYTHONPATH=/Users/vasudev/Nasa_project_2025_V1/Backend /Users/vasudev/Nasa_project_2025_V1/Backend/venv/bin/python -m uvicorn main:app --reload --host 0.0.0.0 --port 8002"
fi

echo ""
echo "3. Testing frontend proxy..."
if curl -s http://localhost:5174/api/weather/current?lat=40.7128&lon=-74.006 >/dev/null 2>&1; then
    echo "✅ Frontend proxy is working"
else
    echo "❌ Frontend proxy is not working"
    echo "Make sure frontend is running on port 5174"
fi

echo ""
echo "🌐 Quick access URLs:"
echo "Frontend: http://localhost:5174"
echo "Backend:  http://localhost:8002"
echo "API Docs: http://localhost:8002/docs"