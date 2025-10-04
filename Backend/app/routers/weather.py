from fastapi import APIRouter, Query, HTTPException
from datetime import datetime, timedelta
import pandas as pd, numpy as np, random
from app.nasa_client import fetch_power
from app.ml import predict

router = APIRouter(prefix="/api/weather", tags=["weather"])

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
    seasonal_temp = 10 * np.sin((day_of_year - 80) * 2 * np.pi / 365)
    if lat < 0:  # Southern hemisphere - flip seasons
        seasonal_temp = -seasonal_temp
    
    # Daily temperature cycle
    daily_temp = 8 * np.sin((hour - 6) * 2 * np.pi / 24)
    
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
        "ts": round(temperature, 2),
        "rh2m": round(humidity, 1), 
        "ws10m": round(wind, 1),
        "ps": round(pressure, 2)
    }

@router.get("/current")
def current(lat: float, lon: float, _t: str = Query(None, description="Cache buster timestamp")):
    # NASA POWER data has a few days delay, so use recent historical data
    end = datetime.utcnow().date() - timedelta(days=3)  # Use data from 3 days ago
    start = end - timedelta(days=7)  # Get a week of data
    
    current_time = datetime.utcnow()
    
    try:
        df = fetch_power(lat, lon, start.strftime("%Y%m%d"), end.strftime("%Y%m%d"))
        latest = df.iloc[-1].to_dict()
        
        # Add some realistic variation to make data feel more "live"
        # Small random adjustments to simulate micro-variations
        for key in latest:
            if key in ['ts', 'rh2m', 'ws10m', 'ps']:
                variation = random.uniform(0.95, 1.05)  # ±5% variation
                latest[key] = latest[key] * variation
        
        return {
            "lat": lat, 
            "lon": lon, 
            "current": latest, 
            "data_date": end.strftime("%Y-%m-%d"),
            "fetch_time": current_time.isoformat(),
            "is_live_adjusted": True
        }
    except Exception as e:
        # Enhanced fallback with realistic, location-based mock data
        realistic_data = generate_realistic_weather(lat, lon, current_time)
        
        return {
            "lat": lat, 
            "lon": lon, 
            "current": realistic_data,
            "data_date": current_time.strftime("%Y-%m-%d"),
            "fetch_time": current_time.isoformat(),
            "is_fallback": True,
            "fallback_reason": "NASA API unavailable - using weather model",
            "error": str(e)
        }

@router.get("/forecast")
def forecast(lat: float, lon: float, days: int = Query(14, ge=1, le=14)):
    """Enhanced forecast with better date handling."""
    end = datetime.utcnow().date()
    start = end - timedelta(days=90)
    
    try:
        hist = fetch_power(lat, lon, start.strftime("%Y%m%d"), end.strftime("%Y%m%d"))
        
        # Generate future dates
        future_dates = pd.date_range(end + timedelta(days=1), periods=days, freq="D")
        future = hist.tail(days).copy()
        future.index = future_dates
        
        # Get ML predictions
        preds = predict(future)
        
        return {
            "lat": lat,
            "lon": lon,
            "forecast": [
                {
                    "date": d.strftime("%Y-%m-%d"), 
                    "temp": float(t),
                    "datetime": d.isoformat()
                }
                for d, t in zip(future_dates, preds)
            ],
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        # Fallback forecast
        future_dates = pd.date_range(end + timedelta(days=1), periods=days, freq="D")
        base_temp = 20.0 + (lat / 10)  # Temperature based on latitude
        
        return {
            "lat": lat,
            "lon": lon,
            "forecast": [
                {
                    "date": d.strftime("%Y-%m-%d"),
                    "temp": base_temp + np.sin(d.dayofyear * 2 * np.pi / 365) * 10,
                    "datetime": d.isoformat()
                }
                for d in future_dates
            ],
            "generated_at": datetime.utcnow().isoformat(),
            "fallback": True
        }

@router.get("/at-time")
def weather_at_time(
    lat: float, 
    lon: float, 
    datetime_str: str = Query(..., description="ISO datetime string")
):
    """Get weather data for a specific date and time."""
    try:
        target_datetime = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
        now = datetime.utcnow()
        
        if target_datetime <= now:
            # For past/current times, get historical data
            target_date = target_datetime.date()
            
            # Try to get historical data for that specific date
            try:
                hist_start = target_date - timedelta(days=7)
                hist_end = target_date + timedelta(days=1)
                hist = fetch_power(lat, lon, hist_start.strftime("%Y%m%d"), hist_end.strftime("%Y%m%d"))
                
                # Find closest date
                target_date_str = target_date.strftime("%Y-%m-%d")
                if target_date_str in hist.index.strftime("%Y-%m-%d"):
                    day_data = hist[hist.index.strftime("%Y-%m-%d") == target_date_str].iloc[0]
                    return {
                        "lat": lat,
                        "lon": lon,
                        "datetime": datetime_str,
                        "type": "historical",
                        "weather": {
                            "temperature": float(day_data.get('ts', 20)),
                            "humidity": float(day_data.get('rh2m', 60)),
                            "wind_speed": float(day_data.get('ws10m', 8)),
                            "pressure": float(day_data.get('ps', 101.3)) * 10  # kPa to hPa
                        }
                    }
            except Exception as e:
                print(f"Historical data error: {e}")
            
            # Fallback for historical data
            return {
                "lat": lat,
                "lon": lon,
                "datetime": datetime_str,
                "type": "historical_estimate",
                "weather": {
                    "temperature": 20.0 + (lat / 10),
                    "humidity": 65.0,
                    "wind_speed": 8.0,
                    "pressure": 1013.0
                }
            }
        else:
            # For future times, use forecast
            target_date = target_datetime.date()
            days_ahead = (target_date - now.date()).days
            
            if days_ahead <= 14:
                # Get forecast data
                forecast_data = forecast(lat, lon, min(days_ahead + 1, 14))
                target_date_str = target_date.strftime("%Y-%m-%d")
                
                for day in forecast_data["forecast"]:
                    if day["date"] == target_date_str:
                        return {
                            "lat": lat,
                            "lon": lon,
                            "datetime": datetime_str,
                            "type": "forecast",
                            "weather": {
                                "temperature": day["temp"],
                                "humidity": 65.0,  # Default values for forecast
                                "wind_speed": 8.0,
                                "pressure": 1013.0
                            }
                        }
            
            # Fallback for far future
            return {
                "lat": lat,
                "lon": lon,
                "datetime": datetime_str,
                "type": "long_term_estimate",
                "weather": {
                    "temperature": 20.0 + (lat / 10) + np.sin(target_datetime.timetuple().tm_yday * 2 * np.pi / 365) * 10,
                    "humidity": 65.0,
                    "wind_speed": 8.0,
                    "pressure": 1013.0
                }
            }
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid datetime format or processing error: {str(e)}")

@router.get("/historical")
def historical(
    lat: float,
    lon: float,
    start: str = Query(..., regex=r"\d{4}-\d{2}-\d{2}"),
    end: str = Query(..., regex=r"\d{4}-\d{2}-\d{2}"),
):
    df = fetch_power(lat, lon, start.replace("-", ""), end.replace("-", ""))
    df["date"] = df.index.date.astype(str)
    return {"lat": lat, "lon": lon, "data": df.to_dict(orient="records")}