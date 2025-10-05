# app/api/v1/endpoints/metrics.py
from fastapi import APIRouter, HTTPException
import json
import os
from pathlib import Path

from app.schemas.metrics import MetricsResponse

router = APIRouter()


@router.get("/metrics", response_model=MetricsResponse)
async def get_model_metrics():
    """
    Retorna as métricas do modelo treinado a partir do arquivo JSON.
    """
    try:
        # Caminho para o arquivo de resultados
        # Vai de specttra-api/app/api/v1/endpoints -> specttra-api -> exoplanet-detection -> training_notebooks
        base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent.parent
        metrics_file = base_dir / "training_notebooks" / "resultados_completos_modelo.json"
        
        if not metrics_file.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Arquivo de métricas não encontrado: {metrics_file}"
            )
        
        # Ler o arquivo JSON
        with open(metrics_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Transformar os dados para o formato esperado
        cv_modelo = data["resultados_cv_melhor_modelo"]
        
        response = {
            "resultados_cv_melhor_modelo": {
                "Modelo": cv_modelo["Modelo"],
                "Threshold_Otimo": cv_modelo["Threshold Ótimo"],
                "AUC_ROC_Media": cv_modelo["AUC ROC Média"],
                "AUC_PRC_Media": cv_modelo["AUC PRC Média"],
                "Acuracia_Media": cv_modelo["Acurácia Média"],
                "Precisao_Planeta_Media": cv_modelo["Precisão (Planeta) Média"],
                "Recall_Planeta_Media": cv_modelo["Recall (Planeta) Média"],
                "Precisao_Non_Planet_Media": cv_modelo["Precisão (Non Planet) Média"],
                "Recall_Non_Planet_Media": cv_modelo["Recall (Non Planet) Média"],
                "F1_Planeta_Media": cv_modelo["F1 (Planeta) Média"],
                "F1_Non_Planet_Media": cv_modelo["F1 (Non Planet) Média"],
            },
            "metricas_globais_teste": data["metricas_globais_teste"],
            "metricas_por_satelite_teste": data["metricas_por_satelite_teste"]
        }
        
        return response
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao ler métricas: {str(e)}"
        )
