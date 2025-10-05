from fastapi import APIRouter
from app.api.v1.endpoints import predict, metrics, train, models

router = APIRouter()
router.include_router(predict.router, tags=["Machine Learning"])
router.include_router(metrics.router, tags=["Metrics"])
router.include_router(train.router, tags=["Train"])
router.include_router(models.router, tags=["Models"])