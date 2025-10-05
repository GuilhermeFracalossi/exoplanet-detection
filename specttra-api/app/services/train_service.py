import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import GroupShuffleSplit
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score,
    roc_auc_score,
    average_precision_score,
    recall_score,
    precision_score,
    f1_score
)
from lightgbm import LGBMClassifier
from datetime import datetime

SEED = 42
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
BASE_DATA_DIR = os.path.join(BASE_DIR, "data", "test_data_for_prediction.csv")
BASE_MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))

def train_model(user_dataset_path: str, main_dataset_path: str, user_params: dict, model_name: str = None):
    """
    Train a LightGBM model using both the base dataset and the user-uploaded dataset.
    Ensures that data is split safely by star system (star_id).

    Args:
        user_dataset_path (str): Path to the user-uploaded CSV.
        main_dataset_path (str): Path to the base dataset.
        user_params (dict): Model hyperparameters provided by the user.
        model_name (str, optional): Custom name for the model.

    Returns:
        dict: Performance metrics and saved model information.
    """
    print("🚀 Starting training with user data...")

    # --- Load datasets ---
    user_df = pd.read_csv(user_dataset_path)
    main_df = pd.read_csv(main_dataset_path)

    # --- Merge datasets ---
    data_final = pd.concat([main_df, user_df], ignore_index=True)
    print(f"Combined dataset contains {data_final.shape[0]} rows.")

    # --- Create star_id from ra and dec ---
    data_final['star_id'] = data_final['ra'].astype(str) + '_' + data_final['dec'].astype(str)

    # --- Define columns ---
    metadata_cols = ['transit_id', 'star_id', 'source', 'ra', 'dec']
    target_col = 'isPlanet'
    feature_cols = [col for col in data_final.columns if col not in metadata_cols + [target_col]]

    # --- Split using GroupShuffleSplit (to avoid data leakage) ---
    gss = GroupShuffleSplit(n_splits=1, test_size=0.15, random_state=SEED)
    train_idx, test_idx = next(gss.split(data_final[feature_cols], data_final[target_col], data_final['star_id']))

    train_df = data_final.iloc[train_idx]
    test_df = data_final.iloc[test_idx]

    print(f"Train: {train_df.shape[0]} samples | Test: {test_df.shape[0]} samples")

    # --- Prepare data ---
    X_train = train_df[feature_cols]
    y_train = train_df[target_col]
    X_test = test_df[feature_cols]
    y_test = test_df[target_col]

    # --- Standardize features ---
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # --- Initialize LightGBM model ---
    model = LGBMClassifier(
        random_state=SEED,
        class_weight='balanced',
        n_estimators=user_params.get("n_estimators", 1600),
        learning_rate=user_params.get("learning_rate", 0.0028),
        lambda_l1=user_params.get("lambda_l1", 1e-8),
        lambda_l2=user_params.get("lambda_l2", 0.2),
        num_leaves=user_params.get("num_leaves", 350),
        max_depth=user_params.get("max_depth", 10),
        feature_fraction=user_params.get("feature_fraction", 0.88),
        bagging_fraction=user_params.get("bagging_fraction", 0.53),
        bagging_freq=user_params.get("bagging_freq", 3),
        min_child_samples=user_params.get("min_child_samples", 16)
    )

    # --- Train model ---
    print("🧠 Training model...")
    model.fit(X_train_scaled, y_train)

    # --- Predictions ---
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]

    # --- Compute evaluation metrics ---
    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "auc_roc": float(roc_auc_score(y_test, y_pred_proba)),
        "auc_prc": float(average_precision_score(y_test, y_pred_proba)),
        "recall_planet": float(recall_score(y_test, y_pred)),
        "precision_planet": float(precision_score(y_test, y_pred)),
        "f1_score_planet": float(f1_score(y_test, y_pred))
    }

    # --- Save model, scaler and metadata ---
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_folder = os.path.join(BASE_MODEL_DIR, f"model_{timestamp}")
    os.makedirs(model_folder, exist_ok=True)

    model_path = os.path.join(model_folder, "lightgbm_model.pkl")
    joblib.dump(model, model_path)
    print(f"✅ Model saved at: {model_path}")

    scaler_path = os.path.join(model_folder, "scaler.pkl")
    joblib.dump(scaler, scaler_path)
    print(f"✅ Scaler saved at: {scaler_path}")

    # --- Save metadata ---
    metadata_folder = os.path.join(model_folder, "metadata")
    os.makedirs(metadata_folder, exist_ok=True)  

    # Use custom name if provided, otherwise use timestamp-based name
    display_name = model_name if model_name else f"lightgbm_model_{timestamp}"

    metadata = {
        "model_name": display_name,
        "model_path": model_path,
        "scaler_path": scaler_path, 
        "created_at": timestamp,
        "params": user_params,
        "metrics": metrics
    }
    
    meta_path = os.path.join(metadata_folder, "metadata.json")
    pd.Series(metadata).to_json(meta_path)
    print(f"📄 Metadata saved at: {meta_path}")

    return {
        "message": "Model and scaler successfully trained and saved!",
        "metrics": metrics,
        "model_path": model_path,
        "scaler_path": scaler_path, 
        "metadata_path": meta_path
    }
