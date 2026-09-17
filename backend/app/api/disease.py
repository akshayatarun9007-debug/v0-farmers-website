from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.models.database import get_db
from backend.app.models.schemas import (
    DiseaseRiskRequest,
    DiseaseRiskResponse,
    DiseasePredictionResponse,
)

router = APIRouter()

@router.post("/disease-risk", response_model=DiseaseRiskResponse)
async def assess_disease_risk(request: DiseaseRiskRequest, db: Session = Depends(get_db)):
    from backend.app.services.disease_service import assess_crop_disease_risk
    return await assess_crop_disease_risk(request, db)

@router.post("/disease-prediction", response_model=DiseasePredictionResponse)
async def predict_disease_image(
    file: UploadFile = File(...),
    crop: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    from backend.app.services.disease_service import predict_leaf_disease
    return await predict_leaf_disease(file, crop, db)
