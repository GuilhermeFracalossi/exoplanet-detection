from fastapi import APIRouter
from app.schemas.predict import ExoplanetFeatures
from app.schemas.response import PredictionResponse
from app.services.predict_service import predict_exoplanet

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
def predict(features: ExoplanetFeatures):
    prediction, confidence = predict_exoplanet(features.dict())
    return PredictionResponse(prediction=prediction, confidence=confidence)
