from fastapi import APIRouter, Query, HTTPException
from datetime import datetime, timedelta
import pandas as pd, numpy as np
from app.nasa_client import fetch_power
from app.ml import predict

router = APIRouter(prefix="/api/weather", tags=["weather"])

@router.get("/current")
def current(lat: float, lon: float):
    end = datetime.utcnow().date()
    start = end - timedelta(days=5)
    df = fetch_power(lat, lon, start.strftime("%Y%m%d"), end.strftime("%Y%m%d"))
    latest = df.iloc[-1].to_dict()
    return {"lat": lat, "lon": lon, "current": latest}

@router.get("/forecast")
def forecast(lat: float, lon: float):
    """7-day forecast (NASA POWER climatology + ML)."""
    end = datetime.utcnow().date()
    start = end - timedelta(days=90)
    hist = fetch_power(lat, lon, start.strftime("%Y%m%d"), end.strftime("%Y%m%d"))
    # simple persistence baseline + ML
    future_dates = pd.date_range(end + timedelta(days=1), periods=14, freq="D")
    future = hist.tail(14).copy()
    future.index = future_dates
    preds = predict(future)
    return {
        "lat": lat,
        "lon": lon,
        "forecast": [
            {"date": d.strftime("%Y-%m-%d"), "temp": float(t)}
            for d, t in zip(future_dates, preds)
        ],
    }

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