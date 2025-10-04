# app/schemas/metrics.py
from pydantic import BaseModel


class ModelMetrics(BaseModel):
    Modelo: str
    AUC_ROC_Media: float
    AUC_PRC_Media: float
    Acuracia_Media: float
    Precisao_Planeta_Media: float
    Recall_Planeta_Media: float
    Precisao_Non_Planet_Media: float
    Recall_Non_Planet_Media: float
    F1_Planeta_Media: float
    F1_Non_Planet_Media: float


class MetricsResponse(BaseModel):
    modelos_internos: list[ModelMetrics]
