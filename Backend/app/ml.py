import joblib, os, pandas as pd, numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error

MODEL_PATH = "rf_temp.pkl"

def engineer(df: pd.DataFrame) -> pd.DataFrame:
    """Add temporal features."""
    df = df.copy()
    df["doy"] = df.index.dayofyear
    df["month"] = df.index.month
    if hasattr(df, 'lat') and not df.empty:
        df["lat"] = df.lat.iloc[0] if 'lat' in df.columns else 40.7  # Default lat
        df["lon"] = df.lon.iloc[0] if 'lon' in df.columns else -74.0  # Default lon
    else:
        df["lat"] = 40.7
        df["lon"] = -74.0
    return df

def train_model(df: pd.DataFrame):
    """Train Random-Forest on TS (temperature)."""
    df = engineer(df)
    # Updated column names for new NASA POWER parameters
    feature_cols = ["doy", "month", "lat", "lon"]
    if "ws10m" in df.columns:
        feature_cols.append("ws10m")
    if "rh2m" in df.columns:
        feature_cols.append("rh2m") 
    if "ps" in df.columns:
        feature_cols.append("ps")
    
    X = df[feature_cols]
    y = df["ts"]
    tscv = TimeSeriesSplit(n_splits=5)
    best = None
    best_rmse = 1e9
    for train_idx, test_idx in tscv.split(X):
        rf = RandomForestRegressor(
            n_estimators=100, max_depth=15, random_state=42
        )
        rf.fit(X.iloc[train_idx], y.iloc[train_idx])
        pred = rf.predict(X.iloc[test_idx])
        rmse = mean_squared_error(y.iloc[test_idx], pred, squared=False)
        if rmse < best_rmse:
            best_rmse = rmse
            best = rf
    joblib.dump(best, MODEL_PATH)
    print("Model saved – RMSE", best_rmse)

def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("Run training first")
    return joblib.load(MODEL_PATH)

def predict(df_future: pd.DataFrame) -> np.ndarray:
    """Return 14-day temperature predictions."""
    try:
        model = load_model()
        df = engineer(df_future)
        
        # Use available features
        feature_cols = ["doy", "month", "lat", "lon"]
        if "ws10m" in df.columns:
            feature_cols.append("ws10m")
        if "rh2m" in df.columns:
            feature_cols.append("rh2m")
        if "ps" in df.columns:
            feature_cols.append("ps")
            
        X = df[feature_cols]
        preds = model.predict(X)
        return preds
    except FileNotFoundError:
        # Fallback: simple seasonal model if no trained model
        print("No trained model found, using seasonal fallback")
        df = engineer(df_future)  # Make sure df is defined for fallback
        base_temp = 20.0
        seasonal_variation = np.sin(df.index.dayofyear * 2 * np.pi / 365) * 10
        return base_temp + seasonal_variation