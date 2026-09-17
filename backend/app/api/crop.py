from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.models.database import get_db
from backend.app.models.schemas import CropRecommendationRequest, CropRecommendationResponse

router = APIRouter()

@router.post("/crop-recommendation", response_model=CropRecommendationResponse)
async def recommend_crop(request: CropRecommendationRequest, db: Session = Depends(get_db)):
    from backend.app.services.crop_service import get_crop_recommendations
    return await get_crop_recommendations(request, db)
