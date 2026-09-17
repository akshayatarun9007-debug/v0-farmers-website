import os
import json
from pathlib import Path
from typing import Dict, Any, List
import pandas as pd
import numpy as np
import joblib
from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.models.database import Prediction, CropPredictionDetail
from backend.app.models.schemas import (
    CropRecommendationRequest,
    CropRecommendationResponse,
    CropSuitabilityItem,
)
from backend.app.utils.agronomic_rules import evaluate_agronomic_safety, INDIAN_CROPS_AGRONOMY
from backend.app.utils.validation import validate_soil_parameters, validate_weather_parameters

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "models" / "crop_recommendation" / "model.joblib"
META_PATH = BASE_DIR / "models" / "crop_recommendation" / "metadata.json"

_cached_model = None
_cached_meta = None


def get_crop_model():
    global _cached_model, _cached_meta
    if _cached_model is None:
        if not MODEL_PATH.exists():
            raise HTTPException(status_code=500, detail="Crop recommendation model artifact not found. Run training script first.")
        _cached_model = joblib.load(MODEL_PATH)
        if META_PATH.exists():
            with open(META_PATH, "r", encoding="utf-8") as f:
                _cached_meta = json.load(f)
        else:
            _cached_meta = {"version": "1.0.0"}
    return _cached_model, _cached_meta


async def get_crop_recommendations(
    request: CropRecommendationRequest,
    db: Session,
) -> CropRecommendationResponse:
    # 1. Validate Soil and Weather Parameters
    valid_soil, soil_errors = validate_soil_parameters(
        request.nitrogen, request.phosphorus, request.potassium, request.ph
    )
    if not valid_soil:
        raise HTTPException(status_code=422, detail="; ".join(soil_errors))

    temp = request.temperature if request.temperature is not None else 26.0
    hum = request.humidity if request.humidity is not None else 65.0
    rain = request.rainfall if request.rainfall is not None else 180.0

    valid_wx, wx_errors = validate_weather_parameters(temp, hum, rain)
    if not valid_wx:
        raise HTTPException(status_code=422, detail="; ".join(wx_errors))

    model, meta = get_crop_model()

    # 2. Prepare Features
    input_df = pd.DataFrame([{
        "n": request.nitrogen,
        "p": request.phosphorus,
        "k": request.potassium,
        "temperature": temp,
        "humidity": hum,
        "ph": request.ph,
        "rainfall": rain,
    }])

    # 3. Model Inference (Probabilities for all 22 classes)
    probs = model.predict_proba(input_df)[0]
    classes = model.classes_

    # Sort crops by probability descending
    top_indices = np.argsort(probs)[::-1]

    recommendations: List[CropSuitabilityItem] = []

    for idx in top_indices:
        score_pct = round(float(probs[idx]) * 100, 1)
        # Keep crops with > 0.5% probability or top 5
        if score_pct < 0.5 and len(recommendations) >= 4:
            break

        crop_raw = classes[idx]
        crop_clean = crop_raw.replace("_", " ").capitalize()

        # Agronomic safety cross-check against ICAR guidelines
        agronomy = evaluate_agronomic_safety(
            crop_name=crop_raw,
            temperature=temp,
            humidity=hum,
            rainfall=rain,
            ph=request.ph,
            season=request.season,
            state=request.state,
        )

        reasons = []
        if agronomy["season_fit"]:
            reasons.append(f"Highly compatible with {request.season} season conditions.")
        if agronomy["temperature_fit"]:
            reasons.append(f"Mean temperature ({temp:.1f}°C) matches the physiological thermal envelope.")
        if agronomy["rainfall_fit"]:
            reasons.append("Rainfall levels support expected vegetative and reproductive water demand.")
        if not reasons:
            reasons.append("Predicted by ML algorithm based on soil nutrient profile.")

        recommendations.append(
            CropSuitabilityItem(
                crop=crop_clean,
                suitability_score=score_pct,
                confidence=round(float(probs[idx]), 3),
                reasons=reasons,
                agronomic_notes=agronomy["agronomic_notes"],
                season_fit=agronomy["season_fit"],
                soil_fit=agronomy["soil_fit"],
                temperature_fit=agronomy["temperature_fit"],
                rainfall_fit=agronomy["rainfall_fit"],
                warnings=agronomy["warnings"],
            )
        )

        if len(recommendations) >= 5:
            break

    top_crop = recommendations[0].crop if recommendations else "Rice"
    has_warnings = any(len(r.warnings) > 0 for r in recommendations[:2])
    safety_status = "Advisory: Inspect warnings" if has_warnings else "Safe: Optimal agronomic fit"

    # 4. Save to Database
    input_data = request.model_dump()
    output_data = {
        "top_crop": top_crop,
        "recommendations": [r.model_dump() for r in recommendations],
        "agronomic_safety_status": safety_status,
    }

    try:
        prediction_rec = Prediction(
            prediction_type="crop_recommendation",
            model_version=meta.get("version", "1.0.0"),
            input_data=input_data,
            output_data=output_data,
        )
        db.add(prediction_rec)
        db.flush()

        detail = CropPredictionDetail(
            prediction_id=prediction_rec.id,
            state=request.state,
            district=request.district,
            season=request.season,
            soil_type=request.soil_type,
            nitrogen=request.nitrogen,
            phosphorus=request.phosphorus,
            potassium=request.potassium,
            ph=request.ph,
            temperature=temp,
            humidity=hum,
            rainfall=rain,
            top_recommended_crop=top_crop,
            suitability_score=recommendations[0].suitability_score if recommendations else 0.0,
            all_recommendations=[r.model_dump() for r in recommendations],
        )
        db.add(detail)
        db.commit()
    except Exception as e:
        db.rollback()
        # Non-fatal logging for DB write failure
        print(f"[!] Warning: Could not save prediction record to DB: {e}")

    return CropRecommendationResponse(
        success=True,
        top_crop=top_crop,
        recommendations=recommendations,
        input_summary=input_data,
        model_version=meta.get("version", "1.0.0"),
        agronomic_safety_status=safety_status,
    )
