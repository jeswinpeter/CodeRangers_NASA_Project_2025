# Smart ML imports - works with or without ML libraries
try:
    import pandas as pd
    import numpy as np
    from sklearn.ensemble import RandomForestRegressor
    ML_AVAILABLE = True
    print("✅ ML libraries loaded - ML features enabled")
except ImportError:
    ML_AVAILABLE = False
    print("⚠️  ML libraries not found - using fallback predictions")

def predict_weather(lat, lon, days=7):
    if ML_AVAILABLE:
        # Real ML prediction
        return advanced_ml_prediction(lat, lon, days)
    else:
        # Simple mathematical prediction
        return simple_weather_prediction(lat, lon, days)

def simple_weather_prediction(lat, lon, days):
    """Works without any ML libraries"""
    import math
    import random
    from datetime import datetime, timedelta
    
    predictions = []
    base_temp = 15 + (25 * (1 - abs(lat) / 90))
    
    for i in range(days):
        future_date = datetime.now() + timedelta(days=i)
        day_of_year = future_date.timetuple().tm_yday
        
        # Seasonal variation using basic math
        seasonal_temp = 10 * math.sin((day_of_year - 80) * 2 * math.pi / 365)
        if lat < 0:  # Southern hemisphere
            seasonal_temp = -seasonal_temp
            
        temp = base_temp + seasonal_temp + random.uniform(-3, 3)
        predictions.append({
            "date": future_date.strftime("%Y-%m-%d"),
            "temperature": round(temp, 1),
            "confidence": 0.75,
            "method": "mathematical_model"
        })
    
    return predictions