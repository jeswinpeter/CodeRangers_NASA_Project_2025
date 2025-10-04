from fastapi import APIRouter, Query
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
    days: int = Query(7, ge=1, le=14),
):
    end = datetime.utcnow().date()
    start = end - timedelta(days=90)
    hist = fetch_power(lat, lon, start.strftime("%Y%m%d"), end.strftime("%Y%m%d"))
    future_dates = pd.date_range(end + timedelta(days=1), periods=days, freq="D")
    future = hist.tail(days).copy()
    future.index = future_dates
    preds = predict(future)
    std = hist["ts"].std()
    # gaussian tail probability
    from scipy.stats import norm
    probs = 1 - norm.cdf(threshold, loc=preds, scale=std)
    return {
        "lat": lat,
        "lon": lon,
        "threshold": threshold,
        "probabilities": [float(p) for p in probs],
    }