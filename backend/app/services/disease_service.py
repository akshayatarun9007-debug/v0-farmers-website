import os
import json
import io
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np
from PIL import Image
import joblib
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from backend.app.models.database import Prediction, DiseasePredictionDetail
from backend.app.models.schemas import (
    DiseaseRiskRequest,
    DiseaseRiskResponse,
    DiseaseAlternative,
    DiseasePredictionResponse,
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "models" / "disease_detection" / "model.joblib"
META_PATH = BASE_DIR / "models" / "disease_detection" / "metadata.json"
ADVISORY_PATH = BASE_DIR / "models" / "disease_detection" / "pathology_advisories.json"

_cached_disease_model = None
_cached_disease_meta = None
_cached_advisories = None


def get_disease_resources():
    global _cached_disease_model, _cached_disease_meta, _cached_advisories
    if _cached_disease_model is None:
        if not MODEL_PATH.exists():
            raise HTTPException(status_code=500, detail="Disease model artifact not found. Run training script first.")
        _cached_disease_model = joblib.load(MODEL_PATH)
        
        if META_PATH.exists():
            with open(META_PATH, "r", encoding="utf-8") as f:
                _cached_disease_meta = json.load(f)
        else:
            _cached_disease_meta = {"version": "1.0.0"}

        if ADVISORY_PATH.exists():
            with open(ADVISORY_PATH, "r", encoding="utf-8") as f:
                _cached_advisories = json.load(f)
        else:
            _cached_advisories = {}

    return _cached_disease_model, _cached_disease_meta, _cached_advisories


def extract_features_from_pil(img: Image.Image) -> np.ndarray:
    img_resized = img.convert("RGB").resize((128, 128))
    arr = np.array(img_resized, dtype=np.float32) / 255.0

    r_mean, g_mean, b_mean = np.mean(arr[:, :, 0]), np.mean(arr[:, :, 1]), np.mean(arr[:, :, 2])
    r_std, g_std, b_std = np.std(arr[:, :, 0]), np.std(arr[:, :, 1]), np.std(arr[:, :, 2])
    green_index = (g_mean - r_mean) / (g_mean + r_mean + 1e-6)

    hist_r, _ = np.histogram(arr[:, :, 0], bins=16, range=(0, 1), density=True)
    hist_g, _ = np.histogram(arr[:, :, 1], bins=16, range=(0, 1), density=True)
    hist_b, _ = np.histogram(arr[:, :, 2], bins=16, range=(0, 1), density=True)

    features = np.concatenate([
        [r_mean, g_mean, b_mean, r_std, g_std, b_std, green_index],
        hist_r, hist_g, hist_b,
    ])
    return features


async def predict_leaf_disease(
    file: UploadFile,
    crop: Optional[str],
    db: Session,
) -> DiseasePredictionResponse:
    # 1. Validate file format
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image (JPEG/PNG/WebP).")

    contents = await file.read()
    try:
        pil_image = Image.open(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")

    model_res, meta, advisories = get_disease_resources()
    clf = model_res["classifier"]
    classes = model_res["classes"]

    # 2. Extract authentic color/vegetative features
    features = extract_features_from_pil(pil_image)
    features_2d = features.reshape(1, -1)

    # 3. Inference
    probs = clf.predict_proba(features_2d)[0]
    top_indices = np.argsort(probs)[::-1]

    top_class = classes[top_indices[0]]
    top_prob = float(probs[top_indices[0]])

    top_predictions = []
    for idx in top_indices[:3]:
        cls_name = classes[idx]
        p_val = round(float(probs[idx]), 3)
        parts = cls_name.split("___")
        crop_part = parts[0].replace("_", " ").strip()
        disease_part = parts[1].replace("_", " ").strip() if len(parts) > 1 else "Healthy"
        top_predictions.append({
            "class_name": cls_name,
            "crop": crop_part,
            "condition": disease_part,
            "probability": p_val,
        })

    # 4. Pathology Advisory lookup
    adv = advisories.get(top_class, {
        "disease_name": top_class.replace("___", " - ").replace("_", " "),
        "is_healthy": "healthy" in top_class.lower(),
        "explanation": "Visual foliar characteristics detected by diagnostic model.",
        "recommended_action": "Inspect plant under natural daylight and consult local Krishi Vigyan Kendra (KVK).",
    })

    inferred_crop = top_predictions[0]["crop"] if not crop else crop
    predicted_condition = adv["disease_name"]

    # 5. Save to Database
    try:
        prediction_rec = Prediction(
            prediction_type="disease_detection",
            model_version=meta.get("version", "1.0.0"),
            input_data={"filename": file.filename, "specified_crop": crop},
            output_data={
                "crop": inferred_crop,
                "predicted_condition": predicted_condition,
                "confidence": round(top_prob, 3),
                "is_healthy": adv["is_healthy"],
                "top_predictions": top_predictions,
            },
        )
        db.add(prediction_rec)
        db.flush()

        detail = DiseasePredictionDetail(
            prediction_id=prediction_rec.id,
            detection_type="image",
            crop=inferred_crop,
            predicted_condition=predicted_condition,
            confidence=round(top_prob, 3),
            risk_level="Healthy" if adv["is_healthy"] else "Active Infection",
            recommended_action=adv["recommended_action"],
            top_alternatives=top_predictions,
        )
        db.add(detail)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[!] Warning: Could not save image disease prediction to DB: {e}")

    return DiseasePredictionResponse(
        success=True,
        crop=inferred_crop,
        predicted_condition=predicted_condition,
        confidence=round(top_prob, 3),
        is_healthy=adv["is_healthy"],
        top_predictions=top_predictions,
        explanation=adv["explanation"],
        recommended_next_action=adv["recommended_action"],
        disclaimer="Image-based AI diagnostic indicator. Field inspection and agricultural extension officer verification recommended before applying chemical sprays.",
        model_version=meta.get("version", "1.0.0"),
    )


# =====================================================================
# NON-IMAGE AGRO-CLIMATIC DISEASE RISK ESTIMATION ENGINE
# =====================================================================
ICAR_PATHOGEN_CONDITIONS = {
    "rice": [
        {
            "disease": "Rice Blast (Magnaporthe oryzae)",
            "temp_range": (18.0, 28.0),
            "humidity_min": 85.0,
            "rainfall_min": 100.0,
            "symptoms": ["spindle-shaped lesions", "gray centers", "brown margins", "neck rot"],
            "action": "Avoid excessive nitrogen application. Apply tricyclazole 75 WP at 0.6g/L or Pseudomonas fluorescens bio-agent.",
        },
        {
            "disease": "Bacterial Leaf Blight (Xanthomonas oryzae)",
            "temp_range": (25.0, 34.0),
            "humidity_min": 80.0,
            "rainfall_min": 150.0,
            "symptoms": ["water-soaked streaks", "wavy margins", "milky bacterial ooze", "yellowing leaf tips"],
            "action": "Drain standing water. Apply copper hydroxide with valid agricultural guidance; do not top-dress nitrogen during active flare-up.",
        },
    ],
    "wheat": [
        {
            "disease": "Yellow / Stripe Rust (Puccinia striiformis)",
            "temp_range": (10.0, 20.0),
            "humidity_min": 70.0,
            "rainfall_min": 20.0,
            "symptoms": ["yellow powdery pustules", "linear stripes on leaves", "stunted growth"],
            "action": "Scout fields regularly in cool humid mornings. Spray propiconazole 25 EC at 1ml/L at first occurrence.",
        },
        {
            "disease": "Powdery Mildew (Blumeria graminis)",
            "temp_range": (15.0, 22.0),
            "humidity_min": 75.0,
            "rainfall_min": 10.0,
            "symptoms": ["white powdery spots", "fuzzy white patches", "chlorosis"],
            "action": "Ensure field aeration. Use sulfur dust or systemic triazole fungicide if flag leaf is threatened.",
        },
    ],
    "tomato": [
        {
            "disease": "Late Blight (Phytophthora infestans)",
            "temp_range": (12.0, 22.0),
            "humidity_min": 85.0,
            "rainfall_min": 50.0,
            "symptoms": ["water-soaked lesions", "white mildew on undersides", "dark rotting stems"],
            "action": "Halt sprinkler irrigation. Spray protectant Mancozeb (2g/L) or Cymoxanil upon verification.",
        },
        {
            "disease": "Early Blight (Alternaria solani)",
            "temp_range": (24.0, 32.0),
            "humidity_min": 75.0,
            "rainfall_min": 30.0,
            "symptoms": ["target-board concentric rings", "yellow halo", "lower leaf drop"],
            "action": "Remove infected lower foliage. Mulch soil to prevent soil splash during rain.",
        },
    ],
    "potato": [
        {
            "disease": "Late Blight (Phytophthora infestans)",
            "temp_range": (12.0, 22.0),
            "humidity_min": 85.0,
            "rainfall_min": 40.0,
            "symptoms": ["rapidly spreading brown lesions", "white downy growth", "foul odor"],
            "action": "Apply preventive copper fungicide prior to canopy closure during cool overcast weeks.",
        },
    ],
    "maize": [
        {
            "disease": "Common Rust (Puccinia sorghi)",
            "temp_range": (16.0, 25.0),
            "humidity_min": 75.0,
            "rainfall_min": 40.0,
            "symptoms": ["golden brown pustules", "ruptured leaf surface", "chlorosis"],
            "action": "Select resistant hybrids and avoid late plantings in high rust corridors.",
        },
    ],
    "cotton": [
        {
            "disease": "Bacterial Blight / Black Arm (Xanthomonas citri pv. malvacearum)",
            "temp_range": (26.0, 35.0),
            "humidity_min": 80.0,
            "rainfall_min": 60.0,
            "symptoms": ["angular leaf spots", "black stem lesions", "boll rot"],
            "action": "Use acid-delinted certified seeds. Spray copper oxychloride 50 WP (2.5g/L) + streptocycline (100mg/L).",
        },
    ],
}


async def assess_crop_disease_risk(
    request: DiseaseRiskRequest,
    db: Session,
) -> DiseaseRiskResponse:
    crop_key = request.crop.lower().strip()
    # Normalize crop name
    if "rice" in crop_key or "paddy" in crop_key:
        crop_clean = "rice"
    elif "wheat" in crop_key:
        crop_clean = "wheat"
    elif "tomato" in crop_key:
        crop_clean = "tomato"
    elif "potato" in crop_key:
        crop_clean = "potato"
    elif "maize" in crop_key or "corn" in crop_key:
        crop_clean = "maize"
    elif "cotton" in crop_key:
        crop_clean = "cotton"
    else:
        crop_clean = crop_key

    diseases = ICAR_PATHOGEN_CONDITIONS.get(crop_clean, [])

    reported_symptoms_lower = [s.lower() for s in request.symptoms]
    reasons: List[str] = []
    possible_diseases: List[DiseaseAlternative] = []
    max_risk_score = 15.0  # baseline environmental risk

    for d in diseases:
        t_min, t_max = d["temp_range"]
        temp_match = t_min <= request.temperature <= t_max
        hum_match = request.humidity >= d["humidity_min"]
        rain_match = request.rainfall >= d["rainfall_min"]

        # Symptom overlap
        matched_symptoms = [s for s in d["symptoms"] if any(rs in s.lower() or s.lower() in rs for rs in reported_symptoms_lower)]

        score = 0.0
        if temp_match:
            score += 25.0
        if hum_match:
            score += 30.0
        if rain_match:
            score += 20.0
        if matched_symptoms:
            score += 25.0 * (len(matched_symptoms) / max(1, len(d["symptoms"])))

        score = min(100.0, score)
        if score > max_risk_score:
            max_risk_score = score

        if score >= 35.0 or matched_symptoms:
            severity = "Severe" if score >= 75 else ("High" if score >= 55 else "Moderate")
            possible_diseases.append(
                DiseaseAlternative(
                    disease=d["disease"],
                    probability=round(score / 100.0, 2),
                    severity=severity,
                    symptoms_match=matched_symptoms,
                )
            )

    # Sort diseases by risk score
    possible_diseases.sort(key=lambda x: x.probability, reverse=True)

    if request.humidity >= 80:
        reasons.append(f"Elevated relative humidity ({request.humidity:.0f}%) creates a microclimate conducive to foliar fungal germination.")
    if request.rainfall >= 100:
        reasons.append(f"Recent heavy precipitation ({request.rainfall:.0f} mm) facilitates water-splash dispersal of soil and plant pathogens.")
    if not reasons:
        reasons.append("Current meteorological parameters present low baseline fungal sporulation threat.")

    if max_risk_score >= 75:
        risk_level = "High"
        action = "High disease outbreak risk. Immediate field scouting and preventive bio-agent or recommended fungicide application advised."
    elif max_risk_score >= 50:
        risk_level = "Moderate"
        action = "Moderate risk. Inspect lower foliage for early lesions. Ensure proper field drainage and avoid evening irrigation."
    else:
        risk_level = "Low"
        action = "Low disease threat under current environmental conditions. Maintain standard cultural practices."

    preventative_measures = [
        "Maintain crop spacing for optimal airflow and sunlight penetration.",
        "Practice crop rotation with non-host legume or cereal crops.",
        "Clean equipment and farm implements when moving between plots.",
        "Consult state agricultural extension officer before applying chemical fungicides.",
    ]

    # Save to DB
    try:
        prediction_rec = Prediction(
            prediction_type="disease_risk",
            model_version="1.0.0-icar-rules",
            input_data=request.model_dump(),
            output_data={
                "crop": request.crop,
                "risk_level": risk_level,
                "risk_score": round(max_risk_score, 1),
                "possible_diseases": [p.model_dump() for p in possible_diseases],
            },
        )
        db.add(prediction_rec)
        db.flush()

        detail = DiseasePredictionDetail(
            prediction_id=prediction_rec.id,
            detection_type="symptom_risk",
            crop=request.crop,
            predicted_condition=possible_diseases[0].disease if possible_diseases else "Low Agro-Climatic Risk",
            confidence=round(max_risk_score / 100.0, 2),
            risk_level=risk_level,
            recommended_action=action,
            top_alternatives=[p.model_dump() for p in possible_diseases],
        )
        db.add(detail)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[!] Warning: Could not save disease risk prediction to DB: {e}")

    return DiseaseRiskResponse(
        success=True,
        crop=request.crop,
        risk_level=risk_level,
        risk_score=round(max_risk_score, 1),
        possible_diseases=possible_diseases,
        reasons=reasons,
        preventative_measures=preventative_measures,
        recommended_action=action,
        disclaimer="Risk estimation based on agro-climatic conditions and reported symptoms. Not a confirmed laboratory diagnosis.",
    )
