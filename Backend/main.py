from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import weather, ml

app = FastAPI(title="NASA Weather Intelligence", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],  # Added Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the real routers with NASA API integration
app.include_router(weather.router)
app.include_router(ml.router)

@app.get("/")
def root():
    return {"message": "NASA Weather Intelligence Dashboard API"}

@app.get("/health")
def health():
    return {"status": "healthy", "service": "NASA Weather Intelligence API"}

@app.get("/api/health")
def api_health():
    return {"status": "healthy", "service": "NASA Weather Intelligence API"}