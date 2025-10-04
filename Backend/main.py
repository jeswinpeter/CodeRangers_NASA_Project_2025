from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="NASA Weather Intelligence", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],  # Added Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "NASA Weather Intelligence Dashboard API"}

@app.get("/health")
def health():
    return {"status": "healthy", "service": "NASA Weather Intelligence API"}

@app.get("/api/health")
def api_health():
    return {"status": "healthy", "service": "NASA Weather Intelligence API"}

# Mock weather endpoints for frontend testing
@app.get("/api/weather/current")
def get_current_weather(lat: float, lon: float):
    """Mock current weather endpoint"""
    import random
    return {
        "location": {
            "latitude": lat,
            "longitude": lon,
            "name": f"Location ({lat:.2f}, {lon:.2f})"
        },
        "current": {
            "temperature": round(random.uniform(10, 30), 1),
            "humidity": random.randint(30, 80),
            "wind_speed": round(random.uniform(5, 25), 1),
            "pressure": random.randint(1000, 1050),
            "visibility": random.randint(5, 15),
            "cloud_cover": random.randint(0, 100),
            "description": random.choice(["Clear", "Partly cloudy", "Cloudy", "Light rain", "Sunny"])
        },
        "timestamp": "2025-10-04T10:00:00Z"
    }

@app.get("/api/weather/forecast")
def get_weather_forecast(lat: float, lon: float):
    """Mock weather forecast endpoint"""
    import random
    from datetime import datetime, timedelta
    
    forecast = []
    for i in range(7):
        date = datetime.now() + timedelta(days=i)
        forecast.append({
            "date": date.strftime("%Y-%m-%d"),
            "temperature_max": random.randint(15, 30),
            "temperature_min": random.randint(5, 20),
            "humidity": random.randint(30, 80),
            "wind_speed": round(random.uniform(5, 25), 1),
            "description": random.choice(["Clear", "Partly cloudy", "Cloudy", "Light rain", "Sunny"])
        })
    
    return {
        "location": {
            "latitude": lat,
            "longitude": lon
        },
        "forecast": forecast
    }

@app.get("/api/ml/predict")
def get_ml_prediction(lat: float, lon: float, days: int = 14):
    """Mock ML prediction endpoint"""
    import random
    from datetime import datetime, timedelta
    
    predictions = []
    for i in range(min(days, 14)):
        date = datetime.now() + timedelta(days=i)
        predictions.append({
            "date": date.strftime("%Y-%m-%d"),
            "predicted_temperature": round(random.uniform(10, 30), 1),
            "confidence": round(random.uniform(0.7, 0.95), 2),
            "model": "NASA Weather AI v1.0"
        })
    
    return {
        "location": {
            "latitude": lat,
            "longitude": lon
        },
        "predictions": predictions,
        "model_info": {
            "name": "NASA Weather AI",
            "version": "1.0",
            "accuracy": 0.87
        }
    }