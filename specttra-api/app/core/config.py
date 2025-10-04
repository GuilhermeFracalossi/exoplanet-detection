import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Exoplanet AI"
    MODEL_PATH: str = os.getenv("MODEL_PATH", "app/models/ml_model.pkl")

settings = Settings()
