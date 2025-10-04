import requests, pandas as pd, datetime as dt
from app.config import NASA_POWER_URL

def fetch_power(
    lat: float,
    lon: float,
    start: str,
    end: str,
    params="TS,WS10M,RH2M,PS",  # Fixed: WS10M instead of MERRA2_SLV_10M_SPEED
    community="RE",
):
    """Return pandas DataFrame with NASA POWER data."""
    url = f"{NASA_POWER_URL}/daily/point"
    resp = requests.get(
        url,
        params={
            "parameters": params,
            "community": community,
            "longitude": lon,
            "latitude": lat,
            "start": start,
            "end": end,
            "format": "JSON",
        },
        timeout=30,
    )
    resp.raise_for_status()
    j = resp.json()
    df = pd.DataFrame(j["properties"]["parameter"])
    df.index = pd.to_datetime(df.index, format="%Y%m%d")
    df = df.rename(columns={p: p.lower() for p in df.columns})
    return df