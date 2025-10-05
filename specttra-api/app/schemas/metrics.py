# app/schemas/metrics.py
from pydantic import BaseModel


class ResultadosCVMelhorModelo(BaseModel):
    Modelo: str
    Threshold_Otimo: float
    AUC_ROC_Media: float
    AUC_PRC_Media: float
    Acuracia_Media: float
    Precisao_Planeta_Media: float
    Recall_Planeta_Media: float
    Precisao_Non_Planet_Media: float
    Recall_Non_Planet_Media: float
    F1_Planeta_Media: float
    F1_Non_Planet_Media: float


class MetricasGlobaisTeste(BaseModel):
    acuracia: float
    auc_roc: float
    auc_prc: float
    recall_planeta: float
    precisao_planeta: float
    f1_score_planeta: float


class MetricasSatelite(BaseModel):
    acuracia: float
    recall_planeta: float
    precisao_planeta: float
    f1_score_planeta: float
    auc_roc: float


class MetricasPorSateliteTeste(BaseModel):
    Kepler: MetricasSatelite
    TESS: MetricasSatelite
    K2: MetricasSatelite


class MetricsResponse(BaseModel):
    resultados_cv_melhor_modelo: ResultadosCVMelhorModelo
    metricas_globais_teste: MetricasGlobaisTeste
    metricas_por_satelite_teste: MetricasPorSateliteTeste
