from pydantic import BaseModel
from typing import Dict

class PredictionResponse(BaseModel):
    transit_id: str
    prediction: str
    confidence: float

class TrainResponse(BaseModel):
    message: str
    metrics: Dict[str, float]