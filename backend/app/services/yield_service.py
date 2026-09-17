import os
import json
from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
import joblib
from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.models.database import Prediction, YieldPredictionDetail
from backend.app.models.schemas import YieldPredictionRequest, YieldPredictionResponse
from backend.app.utils.validation import validate_crop_yield_inputs

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "models" / "yield_prediction" / "model.joblib"
META_PATH = BASE_DIR / "models" / "yield_prediction" / "metadata.json"
BENCH_PATH = BASE_DIR / "models" / "yield_prediction" / "crop_benchmarks.json"

_cached_yield_model = None
_cached_yield_meta = None
_cached_benchmarks = None


def get_yield_resources():
    global _cached_yield_model, _cached_yield_meta, _cached_benchmarks
    if _cached_yield_model is None:
        if not MODEL_PATH.exists():
            raise HTTPException(status_code=500, detail="Yield prediction model artifact not found. Run training script first.")
        _cached_yield_model = joblib.load(MODEL_PATH)

        if META_PATH.exists():
            with open(META_PATH, "r", encoding="utf-8") as f:
                _cached_yield_meta = json.load(f)
        else:
            _cached_yield_meta = {"version": "1.0.0", "metrics": {"residuals_std": 2.5}}

        if BENCH_PATH.exists():
            with open(BENCH_PATH, "r", encoding="utf-8") as f:
                _cached_benchmarks = json.load(f)
        else:
            _cached_benchmarks = {}

    return _cached_yield_model, _cached_yield_meta, _cached_benchmarks


async def predict_crop_yield(
    request: YieldPredictionRequest,
    db: Session,
) -> YieldPredictionResponse:
    # 1. Validation
    valid, errors = validate_crop_yield_inputs(
        request.cultivated_area, request.crop, request.season
    )
    if not valid:
        raise HTTPException(status_code=422, detail="; ".join(errors))

    model, meta, benchmarks = get_yield_resources()

    # 2. Format features
    input_df = pd.DataFrame([{
        "state": request.state.strip(),
        "season": request.season.strip(),
        "crop": request.crop.strip(),
        "area_ha": float(request.cultivated_area),
        "crop_year": int(request.year) if request.year else 2024,
    }])

    # 3. Model Inference
    raw_pred = float(model.predict(input_df)[0])
    # Bounds safety: Yield cannot be negative
    pred_yield = round(max(0.1, raw_pred), 2)
    total_production = round(pred_yield * request.cultivated_area, 2)

    # 4. Statistically calculated Empirical Prediction Interval
    # Derived from validation residual standard deviation
    res_std = meta.get("metrics", {}).get("residuals_std", 1.8)
    ci_lower = round(max(0.1, pred_yield - (1.96 * res_std)), 2)
    ci_upper = round(pred_yield + (1.96 * res_std), 2)
    conf_interval = {
        "confidence_level": 0.95,
        "lower_bound": ci_lower,
        "upper_bound": ci_upper,
        "unit": "tonnes/hectare",
    }

    # 5. Historical crop benchmark comparison
    crop_key = request.crop.strip()
    bench = benchmarks.get(crop_key)
    if not bench:
        # Try case-insensitive matching
        for k, v in benchmarks.items():
            if k.lower() == crop_key.lower():
                bench = v
                break

    hist_benchmark = None
    if bench:
        mean_val = bench["mean"]
        diff_pct = round(((pred_yield - mean_val) / (mean_val + 1e-6)) * 100, 1)
        hist_benchmark = {
            "historical_mean_yield": mean_val,
            "historical_min_yield": bench["min"],
            "historical_max_yield": bench["max"],
            "difference_from_mean_percent": diff_pct,
            "sample_count": bench.get("sample_count", 0),
        }

    input_summary = request.model_dump()
    output_data = {
        "crop": request.crop,
        "predicted_yield_per_hectare": pred_yield,
        "predicted_total_production": total_production,
        "unit": "tonnes/hectare",
        "production_unit": "tonnes",
        "confidence_interval": conf_interval,
        "historical_benchmark": hist_benchmark,
    }

    # 6. Save to Database
    try:
        prediction_rec = Prediction(
            prediction_type="yield_prediction",
            model_version=meta.get("version", "1.0.0"),
            input_data=input_summary,
            output_data=output_data,
        )
        db.add(prediction_rec)
        db.flush()

        detail = YieldPredictionDetail(
            prediction_id=prediction_rec.id,
            crop=request.crop,
            state=request.state,
            district=request.district,
            season=request.season,
            area_hectares=request.cultivated_area,
            predicted_yield_per_hectare=pred_yield,
            predicted_total_production=total_production,
            unit="tonnes/hectare",
            confidence_interval=conf_interval,
        )
        db.add(detail)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[!] Warning: Could not save yield prediction to DB: {e}")

    return YieldPredictionResponse(
        success=True,
        crop=request.crop,
        predicted_yield_per_hectare=pred_yield,
        predicted_total_production=total_production,
        unit="tonnes/hectare",
        production_unit="tonnes",
        confidence_interval=conf_interval,
        historical_benchmark=hist_benchmark,
        model_version=meta.get("version", "1.0.0"),
        input_summary=input_summary,
    )
