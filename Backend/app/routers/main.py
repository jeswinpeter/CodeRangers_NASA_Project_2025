from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import weather, ml

app = FastAPI(title="NASA Weather Intelligence", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather.router)
app.include_router(ml.router)

@app.get("/")
def root():
    return {"message": "NASA Weather Intelligence Dashboard API"}