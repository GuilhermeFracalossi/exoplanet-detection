from fastapi import APIRouter, HTTPException
import os
import json

router = APIRouter()

# Caminho absoluto da pasta onde todos os modelos são salvos
BASE_MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..", "models"))

@router.get("/models")
async def list_models():
    """
    List all trained models with their metadata.
    """
    if not os.path.exists(BASE_MODEL_DIR):
        raise HTTPException(status_code=404, detail="No models directory found." + BASE_MODEL_DIR)

    models_list = []

    # Lista todas as pastas dentro de BASE_MODEL_DIR
    for model_name in sorted(os.listdir(BASE_MODEL_DIR), reverse=True):
        model_path = os.path.join(BASE_MODEL_DIR, model_name)
        metadata_path = os.path.join(model_path, "metadata", "metadata.json")

        if os.path.isdir(model_path) and os.path.exists(metadata_path):
            try:
                with open(metadata_path, "r") as f:
                    metadata = json.load(f)
            except Exception as e:
                metadata = {"error": f"Failed to load metadata: {e}"}

            models_list.append({
                "model_name": model_name,
                "model_path": os.path.join(model_path, "lightgbm_model.pkl"),
                "metadata": metadata
            })

    if not models_list:
        raise HTTPException(status_code=404, detail="No trained models found.")

    return {"models": models_list}
