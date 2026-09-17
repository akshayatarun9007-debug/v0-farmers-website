from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.orm import Session

from backend.app.models.database import get_db, Prediction
from backend.app.models.schemas import PredictionHistoryResponse, PredictionHistoryItem

router = APIRouter()

@router.get("/predictions", response_model=PredictionHistoryResponse)
async def get_prediction_history(
    prediction_type: Optional[str] = Query(None, description="Filter by prediction type"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Prediction).order_by(Prediction.created_at.desc())
    if prediction_type:
        query = query.filter(Prediction.prediction_type == prediction_type)
    
    total = query.count()
    records = query.limit(limit).all()

    items = []
    for r in records:
        summary_text = ""
        if r.prediction_type == "crop_recommendation":
            summary_text = f"Top Crop: {r.output_data.get('top_crop', 'N/A')}"
        elif r.prediction_type == "yield_prediction":
            summary_text = f"{r.output_data.get('crop', 'Crop')}: {r.output_data.get('predicted_yield_per_hectare', 0)} {r.output_data.get('unit', '')}"
        elif r.prediction_type in ("disease_detection", "disease_risk"):
            summary_text = f"{r.output_data.get('crop', 'Crop')}: {r.output_data.get('predicted_condition', r.output_data.get('risk_level', 'Checked'))}"
        else:
            summary_text = "Prediction record"

        items.append(
            PredictionHistoryItem(
                id=r.id,
                prediction_type=r.prediction_type,
                created_at=r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else "",
                model_version=r.model_version,
                summary=summary_text,
                input_data=r.input_data or {},
                output_data=r.output_data or {},
            )
        )

    return PredictionHistoryResponse(total=total, predictions=items)
