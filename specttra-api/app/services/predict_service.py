import pandas as pd
import joblib
from pathlib import Path
from fastapi import HTTPException
from typing import Optional
import os

# Base path to models
BASE_MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))

# Default model and scaler paths
DEFAULT_MODEL_PATH = BASE_MODEL_DIR + "/modelo_exoplanetas.joblib"
DEFAULT_SCALER_PATH = BASE_MODEL_DIR + "/scaler_exoplanetas.joblib"

FEATURE_COLUMNS = [
    'pl_period',
    'pl_transit_duration',
    'pl_radius',
    'st_eff_temp',
    'st_radius'
]

def predict_exoplanets_from_csv(file_like, model_id: Optional[str] = None):
    """
    Receives a CSV file (file-like), applies the trained model, and returns a DataFrame with predictions.
    If model_id is provided, it uses the corresponding model in the BASE_MODEL_DIR folder.
    """
    # Determine model paths
    if model_id:
        model_folder = os.path.join(BASE_MODEL_DIR, model_id)
        model_path = os.path.join(model_folder, "lightgbm_model.pkl")
        scaler_path = os.path.join(model_folder, "scaler.pkl")
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found or incomplete")
    else:
        model_path = DEFAULT_MODEL_PATH
        scaler_path = DEFAULT_SCALER_PATH
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            raise HTTPException(status_code=404, detail="Default model not found")

    # 1. Load model and scaler
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)

    # 2. Load CSV
    new_data_df = pd.read_csv(file_like)
    new_data_df.columns = new_data_df.columns.str.strip()

    print("CSV loaded, shape:", new_data_df.shape)

    # 3. Validate columns
    missing_cols = [col for col in FEATURE_COLUMNS if col not in new_data_df.columns]
    if missing_cols:
        raise ValueError(f"Missing columns in CSV: {missing_cols}, columns received: {list(new_data_df.columns)}")

    transit_ids = new_data_df['transit_id']
    features_to_predict = new_data_df[FEATURE_COLUMNS]

    # 4. Scale
    features_scaled = scaler.transform(features_to_predict)

    # 5. Prediction
    predictions = model.predict(features_scaled)
    probabilities = model.predict_proba(features_scaled)

    # 6. Build final DataFrame
    results_df = pd.DataFrame({
        'transit_id': transit_ids,
        'prediction': predictions.astype(str),
        'confidence': probabilities[:, 1].astype(float)
    })

    return results_df