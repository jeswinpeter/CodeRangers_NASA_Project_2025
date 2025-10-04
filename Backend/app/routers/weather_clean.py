from fastapi import APIRouter, Query, HTTPException
from datetime import datetime, timedelta
import random
import math
import requests

router = APIRouter(prefix="/api/weather", tags=["weather"])

def get_weather_description(temp: float, humidity: float) -> str:
    """Generate realistic weather descriptions based on temperature and humidity"""
    if temp > 30:
        if humidity > 70:
            return "Hot and humid"
        elif humidity > 40:
            return "Hot and dry"
        else:
            return "Very hot and arid"
    elif temp > 20:
        if humidity > 80:
            return "Warm and humid"
        elif humidity > 60:
            return "Pleasant and mild"
        else:
            return "Warm and dry"
    elif temp > 10:
        if humidity > 80:
            return "Cool and damp"
        elif humidity > 60:
            return "Cool and comfortable"
        else:
            return "Cool and dry"
    else:
        if humidity > 80:
            return "Cold and wet"
        elif humidity > 60:
            return "Cold and cloudy"
        else:
            return "Cold and clear"

def fetch_nasa_power_direct(lat: float, lon: float) -> dict:
    """Try to fetch data directly from NASA POWER API"""
    try:
        # Use recent dates (NASA POWER has a few days delay)
        end_date = (datetime.utcnow() - timedelta(days=3)).strftime("%Y%m%d")
        start_date = (datetime.utcnow() - timedelta(days=5)).strftime("%Y%m%d")
        
        url = "https://power.larc.nasa.gov/api/temporal/daily/point"
        params = {
            "parameters": "T2M,RH2M,WS10M,PS",
            "community": "RE",
            "longitude": lon,
            "latitude": lat,
            "start": start_date,
            "end": end_date,
            "format": "JSON"
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        parameters = data["properties"]["parameter"]
        
        # Get the latest data
        dates = list(parameters["T2M"].keys())
        latest_date = max(dates)
        
        return {
            "temperature": parameters["T2M"][latest_date],
            "humidity": parameters["RH2M"][latest_date],
            "wind_speed": parameters["WS10M"][latest_date],
            "pressure": parameters["PS"][latest_date],
            "visibility": round(random.uniform(5, 15), 1),
            "cloud_cover": round(random.uniform(0, 100)),
            "description": get_weather_description(parameters["T2M"][latest_date], parameters["RH2M"][latest_date])
        }
    except Exception as e:
        print(f"NASA API fetch failed: {e}")
        return None

def generate_realistic_weather(lat: float, lon: float, base_timestamp: datetime = None):
    """Generate realistic weather data based on location and time"""
    if not base_timestamp:
        base_timestamp = datetime.utcnow()
    
    # Time-based variations
    hour = base_timestamp.hour
    day_of_year = base_timestamp.timetuple().tm_yday
    
    # Base temperature from latitude (warmer near equator)
    base_temp = 15 + (25 * (1 - abs(lat) / 90))
    
    # Seasonal variation (northern hemisphere bias)
    seasonal_temp = 10 * math.sin((day_of_year - 80) * 2 * math.pi / 365)
    if lat < 0:  # Southern hemisphere - flip seasons
        seasonal_temp = -seasonal_temp
    
    # Daily temperature cycle
    daily_temp = 8 * math.sin((hour - 6) * 2 * math.pi / 24)
    
    # Add some realistic random variation
    random_var = random.uniform(-3, 3)
    
    # Final temperature
    temperature = base_temp + seasonal_temp + daily_temp + random_var
    
    # Generate correlated weather parameters
    # Higher temps tend to have lower humidity and higher pressure
    humidity = max(20, min(95, 70 - (temperature - 20) * 0.8 + random.uniform(-15, 15)))
    pressure = max(98, min(105, 101.3 + (temperature - 20) * 0.1 + random.uniform(-1.5, 1.5)))
    
    # Wind speed based on pressure differences and random variation
    wind = max(0, min(25, 5 + random.uniform(-3, 8) + abs(101.3 - pressure) * 2))
    
    return {
        "temperature": round(temperature, 2),
        "humidity": round(humidity, 1), 
        "wind_speed": round(wind, 1),
        "pressure": round(pressure, 2),
        "visibility": round(random.uniform(5, 15), 1),
        "cloud_cover": round(random.uniform(0, 100)),
        "description": get_weather_description(temperature, humidity)
    }

@router.get("/current")
def current(lat: float, lon: float, _t: str = Query(None, description="Cache buster timestamp")):
    current_time = datetime.utcnow()
    
    # Try to fetch NASA POWER data directly
    try:
        nasa_data = fetch_nasa_power_direct(lat, lon)
        if nasa_data:
            return {
                "lat": lat, 
                "lon": lon, 
                "current": nasa_data,
                "timestamp": current_time.isoformat(),
                "data_source": "NASA POWER API"
            }
    except Exception as e:
        print(f"NASA API error: {e}")
    
    # Fallback to realistic mock data
    realistic_data = generate_realistic_weather(lat, lon, current_time)
    
    return {
        "lat": lat, 
        "lon": lon, 
        "current": realistic_data,
        "timestamp": current_time.isoformat(),
        "data_source": "Weather Model (NASA API Unavailable)"
    }

@router.get("/forecast")
def forecast(lat: float, lon: float, days: int = Query(14, ge=1, le=14)):
    """Enhanced forecast with better date handling."""
    current_time = datetime.utcnow()
    
    forecast_data = []
    for i in range(1, days + 1):
        future_date = current_time + timedelta(days=i)
        weather = generate_realistic_weather(lat, lon, future_date)
        
        forecast_data.append({
            "date": future_date.strftime("%Y-%m-%d"),
            "temperature": weather["temperature"],
            "humidity": weather["humidity"],
            "wind_speed": weather["wind_speed"],
            "pressure": weather["pressure"],
            "description": weather["description"]
        })
    
    return {
        "lat": lat,
        "lon": lon,
        "forecast": forecast_data,
        "generated_at": current_time.isoformat()
    }

@router.get("/historical")
def historical(
    lat: float,
    lon: float,
    start: str = Query(..., regex=r"\d{4}-\d{2}-\d{2}"),
    end: str = Query(..., regex=r"\d{4}-\d{2}-\d{2}"),
):
    """Generate historical weather data"""
    start_date = datetime.strptime(start, "%Y-%m-%d")
    end_date = datetime.strptime(end, "%Y-%m-%d")
    
    historical_data = []
    current_date = start_date
    
    while current_date <= end_date:
        weather = generate_realistic_weather(lat, lon, current_date)
        historical_data.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "temperature": weather["temperature"],
            "humidity": weather["humidity"],
            "wind_speed": weather["wind_speed"],
            "pressure": weather["pressure"],
            "description": weather["description"]
        })
        current_date += timedelta(days=1)
    
    return {
        "lat": lat,
        "lon": lon,
        "data": historical_data,
        "period": f"{start} to {end}"
    }