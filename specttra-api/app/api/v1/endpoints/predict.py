# app/api/v1/endpoints/predict.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import pandas as pd
import io

from app.schemas.response import PredictionResponse
from app.services.predict_service import predict_exoplanets_from_csv

router = APIRouter()

@router.post("/predict", response_model=List[PredictionResponse])
async def predict_csv(file: UploadFile = File(...)):
    # Validate file
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    try:
        contents = await file.read()
        df_result = predict_exoplanets_from_csv(io.BytesIO(contents))

        result_list = df_result.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading CSV: {e}")
   
    return result_list
