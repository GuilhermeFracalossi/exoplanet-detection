from fastapi import FastAPI
from app.api.v1.router import router as api_router

app = FastAPI(
    title="Exoplanet AI API",
    version="1.0.0",
    description="API for classifying exoplanets using NASA open datasets and ML models"
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Welcome to Exoplanet AI API"}
