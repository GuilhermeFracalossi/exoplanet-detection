from typing import List, Optional
import io
from fastapi import APIRouter, UploadFile, File, HTTPException, Form

from app.schemas.response import PredictionResponse
from app.services.predict_service import predict_exoplanets_from_csv

# Initialize the router
router = APIRouter()

@router.post("/predict", response_model=List[PredictionResponse], summary="Predict exoplanet status from a CSV file")
async def predict_csv(file: UploadFile = File(..., description="A CSV file containing exoplanet transit features."), model_id: Optional[str] = Form(None, description="Optional ID of a specific model to use.")):
    """
    Receives an uploaded CSV file, passes its contents to the core prediction service, 
    and returns a list of prediction results (status and confidence) for each transit.
    """
    try:
        contents = await file.read()
        df_result = predict_exoplanets_from_csv(io.BytesIO(contents), model_id=model_id)
        return df_result.to_dict(orient="records")

    except HTTPException as e:
        raise e
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Input data validation failed: {e}")
        
    except Exception as e:
        print(f"An unexpected error occurred during prediction: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred while processing the prediction request.")
