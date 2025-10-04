import os
from dotenv import load_dotenv
load_dotenv()
NASA_POWER_URL = os.getenv("NASA_POWER_URL", "https://power.larc.nasa.gov/api/temporal")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")