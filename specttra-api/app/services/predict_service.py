# app/services/predict_service.py
import pandas as pd
import joblib
from pathlib import Path
from fastapi import HTTPException

# Get absolute path to the project root dynamically
BASE_DIR = Path(__file__).resolve().parent.parent

# Define paths to models
MODEL_PATH = BASE_DIR / "models" / "modelo_exoplanetas.joblib"
SCALER_PATH = BASE_DIR / "models" / "scaler_exoplanetas.joblib"

FEATURE_COLUMNS = [
    "pl_period",
    "pl_transit_duration",
    "pl_transit_depth",
    "pl_radius",
    "pl_eq_temp",
    "pl_insolation_flux",
    "st_eff_temp",
    "st_radius",
    "st_logg"
]

def predict_exoplanets_from_csv(file_like):
    """
    Recebe um arquivo CSV (file-like), aplica o modelo treinado e retorna um DataFrame com previsões.
    """
    # 1. Carregar modelo e scaler
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    # 2. Carregar CSV
    novos_dados_df = pd.read_csv(file_like)
    novos_dados_df.columns = novos_dados_df.columns.str.strip()
    # 3. Validar colunas
    missing_cols = [col for col in FEATURE_COLUMNS if col not in novos_dados_df.columns]
    if missing_cols:
        raise ValueError(f"Faltando colunas no CSV: {missing_cols}, colunas recebidas: {list(novos_dados_df.columns)}")

    ids_dos_transitos = novos_dados_df['transit_id']
    features_para_prever = novos_dados_df[FEATURE_COLUMNS]

    # 4. Escalar
    features_scaled = scaler.transform(features_para_prever)

    # 5. Predição
    predicoes = model.predict(features_scaled)
    probabilidades = model.predict_proba(features_scaled)

    # 6. Montar DataFrame final
    resultados_df = pd.DataFrame({
        'transit_id': novos_dados_df['transit_id'],  # converte para int
        'prediction': predicoes.astype(str),                     # converte para string
        'confidence': probabilidades[:, 1].astype(float)        # garante float
    })

    return resultados_df
