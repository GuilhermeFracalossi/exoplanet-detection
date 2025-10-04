import numpy as np
from app.core.model_loader import ModelLoader

def predict_exoplanet(features: dict):
    model = ModelLoader.load_model()
    X = np.array([[features["orbital_period"],
                   features["transit_duration"],
                   features["planet_radius"],
                   features["star_radius"],
                   features["star_temp"]]])
    
    prediction = model.predict(X)[0]
    if hasattr(model, "predict_proba"):
        confidence = np.max(model.predict_proba(X))
    else:
        confidence = 1.0  # fallback for models without probabilities
    return prediction, confidence
