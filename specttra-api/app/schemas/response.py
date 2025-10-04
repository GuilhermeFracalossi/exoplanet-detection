from pydantic import BaseModel

class PredictionResponse(BaseModel):
    transit_id: str
    prediction: str
    confidence: float