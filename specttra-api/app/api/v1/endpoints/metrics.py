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
        modelos_internos = []
        for modelo in data.get("modelos_internos", []):
            modelos_internos.append({
                "Modelo": modelo["Modelo"],
                "AUC_ROC_Media": modelo["AUC ROC Média"],
                "AUC_PRC_Media": modelo["AUC PRC Média"],
                "Acuracia_Media": modelo["Acurácia Média"],
                "Precisao_Planeta_Media": modelo["Precisão (Planeta) Média"],
                "Recall_Planeta_Media": modelo["Recall (Planeta) Média"],
                "Precisao_Non_Planet_Media": modelo["Precisão (Non Planet) Média"],
                "Recall_Non_Planet_Media": modelo["Recall (Non Planet) Média"],
                "F1_Planeta_Media": modelo["F1 (Planeta) Média"],
                "F1_Non_Planet_Media": modelo["F1 (Non Planet) Média"],
            })
        
        return {"modelos_internos": modelos_internos}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao ler métricas: {str(e)}"
        )
