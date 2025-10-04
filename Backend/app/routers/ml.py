from fastapi import APIRouter, Query, HTTPException
from datetime import datetime, timedelta
import pandas as pd, numpy as np
from app.nasa_client import fetch_power
from app.ml import predict

router = APIRouter(prefix="/api/ml", tags=["ml"])

@router.get("/predict")
def ml_predict(lat: float, lon: float, days: int = Query(14, ge=1, le=14)):
    end = datetime.utcnow().date()
    start = end - timedelta(days=90)
    hist = fetch_power(lat, lon, start.strftime("%Y%m%d"), end.strftime("%Y%m%d"))
    future_dates = pd.date_range(end + timedelta(days=1), periods=days, freq="D")
    future = hist.tail(days).copy()
    future.index = future_dates
    preds = predict(future)
    # crude confidence interval
    std = hist["ts"].std()
    return {
        "lat": lat,
        "lon": lon,
        "predictions": [
            {
                "date": d.strftime("%Y-%m-%d"),
                "temp": float(t),
                "lower": float(t - 1.96 * std),
                "upper": float(t + 1.96 * std),
            }
            for d, t in zip(future_dates, preds)
        ],
    }

@router.get("/probability")
def probability(
    lat: float,
    lon: float,
    threshold: float,
    parameter: str = Query("temperature", regex="^(temperature|humidity|windSpeed|pressure)$"),
    operator: str = Query(">", regex="^(>|<|>=|<=|=)$"),
    start_date: str = Query(None, regex=r"\d{4}-\d{2}-\d{2}"),
    end_date: str = Query(None, regex=r"\d{4}-\d{2}-\d{2}"),
    days: int = Query(7, ge=1, le=30),  # Extended to 30 days
):
    """Calculate probability of weather threshold being exceeded for specified date range."""
    from scipy.stats import norm
    
    # Determine prediction date range
    if start_date and end_date:
        # Use specified date range
        pred_start = datetime.strptime(start_date, "%Y-%m-%d").date()
        pred_end = datetime.strptime(end_date, "%Y-%m-%d").date()
        pred_days = (pred_end - pred_start).days + 1
        future_dates = pd.date_range(pred_start, pred_end, freq="D")
    else:
        # Use default: next N days from today
        today = datetime.utcnow().date()
        pred_start = today + timedelta(days=1)
        pred_end = pred_start + timedelta(days=days-1)
        pred_days = days
        future_dates = pd.date_range(pred_start, pred_end, freq="D")
    
    # Get historical data for training (last 90 days)
    hist_end = datetime.utcnow().date()
    hist_start = hist_end - timedelta(days=90)
    hist = fetch_power(lat, lon, hist_start.strftime("%Y%m%d"), hist_end.strftime("%Y%m%d"))
    
    # Prepare future data for predictions
    future = hist.tail(pred_days).copy()
    future.index = future_dates
    
    # Parameter mapping from frontend to NASA POWER parameters
    param_mapping = {
        "temperature": "ts",      # Temperature at 2m (°C)
        "humidity": "rh2m",       # Relative Humidity at 2m (%)
        "windSpeed": "ws10m",     # Wind Speed at 10m (m/s)
        "pressure": "ps"          # Surface Pressure (kPa)
    }
    
    nasa_param = param_mapping.get(parameter, "ts")
    
    # Check if parameter exists in historical data
    if nasa_param not in hist.columns:
        # Fallback to temperature if parameter not available
        nasa_param = "ts"
        parameter = "temperature"
    
    # Get predictions for the specified parameter
    if nasa_param == "ts":
        # Use existing ML model for temperature
        preds = predict(future)
    else:
        # For other parameters, use simple persistence model with seasonal adjustment
        recent_values = hist[nasa_param].tail(14).values
        seasonal_factor = np.sin(future_dates.dayofyear * 2 * np.pi / 365)
        
        if nasa_param == "rh2m":  # Humidity
            base_values = np.mean(recent_values)
            preds = base_values + seasonal_factor * 10  # ±10% seasonal variation
        elif nasa_param == "ws10m":  # Wind Speed
            base_values = np.mean(recent_values)
            preds = base_values + seasonal_factor * 2   # ±2 m/s seasonal variation
        elif nasa_param == "ps":  # Pressure
            base_values = np.mean(recent_values)
            preds = base_values + seasonal_factor * 5   # ±5 kPa seasonal variation
        else:
            preds = np.full(len(future_dates), np.mean(recent_values))
    
    # Calculate standard deviation for uncertainty
    std = hist[nasa_param].std()
    
    # Apply threshold probability calculation based on operator
    if operator == ">":
        probs = 1 - norm.cdf(threshold, loc=preds, scale=std)
    elif operator == ">=":
        probs = 1 - norm.cdf(threshold - 0.001, loc=preds, scale=std)  # Small epsilon for >=
    elif operator == "<":
        probs = norm.cdf(threshold, loc=preds, scale=std)
    elif operator == "<=":
        probs = norm.cdf(threshold + 0.001, loc=preds, scale=std)     # Small epsilon for <=
    elif operator == "=":
        # For equality, use a small range around the threshold
        epsilon = std * 0.1  # 10% of standard deviation
        probs = norm.cdf(threshold + epsilon, loc=preds, scale=std) - norm.cdf(threshold - epsilon, loc=preds, scale=std)
    else:
        probs = 1 - norm.cdf(threshold, loc=preds, scale=std)  # Default to >
    
    # Ensure probabilities are between 0 and 1
    probs = np.clip(probs, 0, 1)
    
    # Calculate overall probability for the entire period
    overall_prob = 1 - np.prod(1 - probs)  # Probability that threshold is exceeded at least once
    
    return {
        "lat": lat,
        "lon": lon,
        "parameter": parameter,
        "threshold": threshold,
        "operator": operator,
        "start_date": pred_start.strftime("%Y-%m-%d"),
        "end_date": pred_end.strftime("%Y-%m-%d"),
        "days": pred_days,
        "daily_probabilities": [
            {
                "date": date.strftime("%Y-%m-%d"),
                "probability": float(prob),
                "predicted_value": float(pred)
            }
            for date, prob, pred in zip(future_dates, probs, preds)
        ],
        "overall_probability": float(overall_prob),
        "summary": f"{overall_prob*100:.1f}% chance that {parameter} will be {operator} {threshold} during this period"
    }

@router.post("/analyze")
def analyze_weather_risk(
    lat: float,
    lon: float,
    location_name: str,
    threshold: float,
    parameter: str = Query("temperature", regex="^(temperature|humidity|windSpeed|pressure)$"),
    operator: str = Query(">", regex="^(>|<|>=|<=|=)$"),
    start_date: str = Query(..., regex=r"\d{4}-\d{2}-\d{2}"),
    end_date: str = Query(..., regex=r"\d{4}-\d{2}-\d{2}"),
):
    """
    Comprehensive weather risk analysis endpoint for the new workflow.
    This endpoint provides detailed analysis results for the user's selected criteria.
    """
    try:
        # Validate date range
        start_dt = datetime.strptime(start_date, "%Y-%m-%d").date()
        end_dt = datetime.strptime(end_date, "%Y-%m-%d").date()
        
        if start_dt >= end_dt:
            raise HTTPException(status_code=400, detail="End date must be after start date")
        
        if (end_dt - start_dt).days > 30:
            raise HTTPException(status_code=400, detail="Date range cannot exceed 30 days")
        
        # Get probability analysis
        prob_result = probability(
            lat=lat,
            lon=lon,
            threshold=threshold,
            parameter=parameter,
            operator=operator,
            start_date=start_date,
            end_date=end_date
        )
        
        # Get historical context (last 365 days)
        hist_end = datetime.utcnow().date()
        hist_start = hist_end - timedelta(days=365)
        hist = fetch_power(lat, lon, hist_start.strftime("%Y%m%d"), hist_end.strftime("%Y%m%d"))
        
        # Parameter mapping
        param_mapping = {
            "temperature": "ts",
            "humidity": "rh2m", 
            "windSpeed": "ws10m",
            "pressure": "ps"
        }
        nasa_param = param_mapping.get(parameter, "ts")
        
        # Calculate historical statistics
        if nasa_param in hist.columns:
            hist_values = hist[nasa_param].dropna()
            
            # Apply the same threshold check to historical data
            if operator == ">":
                historical_exceedances = (hist_values > threshold).sum()
            elif operator == ">=":
                historical_exceedances = (hist_values >= threshold).sum()
            elif operator == "<":
                historical_exceedances = (hist_values < threshold).sum()
            elif operator == "<=":
                historical_exceedances = (hist_values <= threshold).sum()
            elif operator == "=":
                epsilon = hist_values.std() * 0.1
                historical_exceedances = ((hist_values >= threshold - epsilon) & 
                                        (hist_values <= threshold + epsilon)).sum()
            else:
                historical_exceedances = (hist_values > threshold).sum()
            
            historical_rate = historical_exceedances / len(hist_values) * 100
            
            hist_stats = {
                "mean": float(hist_values.mean()),
                "std": float(hist_values.std()),
                "min": float(hist_values.min()),
                "max": float(hist_values.max()),
                "historical_exceedance_rate": float(historical_rate),
                "total_days": len(hist_values),
                "exceedance_days": int(historical_exceedances)
            }
        else:
            hist_stats = {
                "mean": None,
                "std": None,
                "min": None,
                "max": None,
                "historical_exceedance_rate": None,
                "total_days": 0,
                "exceedance_days": 0
            }
        
        # Calculate risk assessment
        risk_level = "Low"
        if prob_result["overall_probability"] > 0.7:
            risk_level = "High"
        elif prob_result["overall_probability"] > 0.4:
            risk_level = "Medium"
        
        # Create comprehensive response
        return {
            "analysis_id": f"{lat}_{lon}_{parameter}_{start_date}_{end_date}",
            "location": {
                "name": location_name,
                "latitude": lat,
                "longitude": lon
            },
            "criteria": {
                "parameter": parameter,
                "operator": operator,
                "threshold": threshold,
                "date_range": {
                    "start": start_date,
                    "end": end_date,
                    "days": (end_dt - start_dt).days + 1
                }
            },
            "results": {
                "overall_probability": prob_result["overall_probability"],
                "risk_level": risk_level,
                "summary": prob_result["summary"],
                "daily_probabilities": prob_result["daily_probabilities"]
            },
            "historical_context": hist_stats,
            "generated_at": datetime.utcnow().isoformat(),
            "data_source": "NASA POWER API"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")