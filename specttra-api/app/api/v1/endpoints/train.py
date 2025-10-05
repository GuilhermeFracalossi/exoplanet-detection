from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import io
import json
import tempfile
import os

from app.services.train_service import train_model

router = APIRouter()

# Path to your main/base dataset
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
BASE_DATASET_PATH = os.path.join(BASE_DIR, "data", "base_exoplanet_dataset.csv")

@router.post("/train")
async def train_lightgbm_endpoint(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    hyperparams: Optional[str] = Form(None)
):
    """
    Receives a CSV uploaded by the user, merges it with the base dataset,
    trains and evaluates a LightGBM model using the provided hyperparameters.
    Returns test metrics and stores model metadata.
    """

    # --- Validate file type ---
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    try:
        # --- Save uploaded file temporarily ---
        contents = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp_file:
            tmp_file.write(contents)
            user_csv_path = tmp_file.name

        # --- Parse hyperparameters ---
        user_params = {}
        if hyperparams:
            try:
                user_params = json.loads(hyperparams)
            except json.JSONDecodeError as e:
                raise HTTPException(status_code=400, detail=f"Invalid hyperparams JSON: {e}")

        # --- Train model ---
        result = train_model(user_csv_path, BASE_DATASET_PATH, user_params, model_name=name)

        # --- Cleanup temporary file ---
        os.remove(user_csv_path)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {e}")
