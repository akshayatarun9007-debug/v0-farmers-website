from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.models.database import get_db
from backend.app.models.schemas import YieldPredictionRequest, YieldPredictionResponse

router = APIRouter()

@router.post("/yield-prediction", response_model=YieldPredictionResponse)
async def predict_yield(request: YieldPredictionRequest, db: Session = Depends(get_db)):
    from backend.app.services.yield_service import predict_crop_yield
    return await predict_crop_yield(request, db)
