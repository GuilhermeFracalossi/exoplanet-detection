from fastapi import APIRouter
from app.api.v1.endpoints import predict, metrics

router = APIRouter()
router.include_router(predict.router, tags=["Machine Learning"])
router.include_router(metrics.router, tags=["Metrics"])
