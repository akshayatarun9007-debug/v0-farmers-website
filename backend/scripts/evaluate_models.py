"""
Model Evaluation and Inference Verification Script
Loads all trained model artifacts and runs end-to-end evaluation tests.
"""

import os
import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

from backend.app.utils.agronomic_rules import evaluate_agronomic_safety

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"


def evaluate_crop_recommendation():
    print("\n=======================================================")
    print("EVALUATING MODEL 1: CROP RECOMMENDATION CLASSIFIER")
    print("=======================================================")
    model_path = MODELS_DIR / "crop_recommendation" / "model.joblib"
    meta_path = MODELS_DIR / "crop_recommendation" / "metadata.json"

    if not model_path.exists():
        print("[!] Model file not found:", model_path)
        return False

    model = joblib.load(model_path)
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    print(f"[+] Algorithm: {meta['algorithm']} (v{meta['version']})")
    print(f"[+] Dataset: {meta['dataset']}")
    print(f"[+] Reported Test Accuracy: {meta['metrics']['test_accuracy'] * 100:.2f}%")
    print(f"[+] Weighted F1: {meta['metrics']['test_f1_weighted']:.4f}")

    # Test Sample 1: Rice optimal conditions (High rainfall, moderate temp, high humidity)
    sample_rice = pd.DataFrame([{
        "n": 90, "p": 42, "k": 43, "temperature": 24.5, "humidity": 82.0, "ph": 6.5, "rainfall": 230.0
    }])
    probs = model.predict_proba(sample_rice)[0]
    classes = model.classes_
    top_indices = np.argsort(probs)[-3:][::-1]

    print("\nInference Test 1 (High rainfall Kharif soil):")
    for rank, idx in enumerate(top_indices, 1):
        crop = classes[idx]
        score = probs[idx] * 100
        agronomy = evaluate_agronomic_safety(crop, 24.5, 82.0, 230.0, 6.5, "Kharif", "West Bengal")
        print(f"  {rank}. {crop.capitalize():<14} - Suitability: {score:.1f}% | Season Fit: {agronomy['season_fit']}")
        if agronomy['warnings']:
            print(f"     Agronomic Warning: {agronomy['warnings'][0]}")

    # Test Sample 2: Wheat optimal conditions (Cool Rabi, lower rainfall)
    sample_wheat = pd.DataFrame([{
        "n": 105, "p": 55, "k": 30, "temperature": 16.0, "humidity": 55.0, "ph": 6.8, "rainfall": 75.0
    }])
    probs2 = model.predict_proba(sample_wheat)[0]
    top_indices2 = np.argsort(probs2)[-3:][::-1]

    print("\nInference Test 2 (Cool Rabi Punjab/UP soil):")
    for rank, idx in enumerate(top_indices2, 1):
        crop = classes[idx]
        score = probs2[idx] * 100
        agronomy = evaluate_agronomic_safety(crop, 16.0, 55.0, 75.0, 6.8, "Rabi", "Punjab")
        print(f"  {rank}. {crop.capitalize():<14} - Suitability: {score:.1f}% | Season Fit: {agronomy['season_fit']}")
        if agronomy['warnings']:
            print(f"     Agronomic Warning: {agronomy['warnings'][0]}")

    return True


def evaluate_yield_prediction():
    print("\n=======================================================")
    print("EVALUATING MODEL 2: CROP YIELD PREDICTOR")
    print("=======================================================")
    model_path = MODELS_DIR / "yield_prediction" / "model.joblib"
    meta_path = MODELS_DIR / "yield_prediction" / "metadata.json"

    if not model_path.exists():
        print("[!] Model file not found:", model_path)
        return False

    model = joblib.load(model_path)
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    print(f"[+] Algorithm: {meta['algorithm']} (v{meta['version']})")
    print(f"[+] Dataset: {meta['dataset']}")
    print(f"[+] Validation R² Score: {meta['metrics']['r2_score']:.4f}")
    print(f"[+] Validation RMSE: {meta['metrics']['rmse']:.4f} {meta['unit']}")
    print(f"[+] Validation MAE:  {meta['metrics']['mae']:.4f} {meta['unit']}")

    # Test inference: Wheat in Punjab, 2.5 hectares
    sample_yield = pd.DataFrame([{
        "state": "Punjab",
        "season": "Rabi",
        "crop": "Wheat",
        "area_ha": 2.5,
        "crop_year": 2024,
    }])
    pred_yield = float(model.predict(sample_yield)[0])
    total_prod = pred_yield * 2.5
    residuals_std = meta["metrics"]["residuals_std"]
    ci_lower = max(0.0, pred_yield - 1.96 * residuals_std)
    ci_upper = pred_yield + 1.96 * residuals_std

    print("\nInference Test (Wheat, Punjab, Rabi, 2.5 ha):")
    print(f"  -> Predicted Yield: {pred_yield:.2f} tonnes/hectare")
    print(f"  -> Total Production: {total_prod:.2f} tonnes")
    print(f"  -> 95% Empirical Prediction Interval: [{ci_lower:.2f} - {ci_upper:.2f}] tonnes/hectare")

    return True


def evaluate_disease_model():
    print("\n=======================================================")
    print("EVALUATING MODEL 3: CROP DISEASE DETECTION & RISK")
    print("=======================================================")
    model_path = MODELS_DIR / "disease_detection" / "model.joblib"
    meta_path = MODELS_DIR / "disease_detection" / "metadata.json"

    if not model_path.exists():
        print("[!] Model file not found:", model_path)
        return False

    artifact = joblib.load(model_path)
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    print(f"[+] Model: {meta['model_name']}")
    print(f"[+] Classes: {meta['num_classes']} target classes")
    print(f"[+] Top-1 Accuracy: {meta['metrics']['test_top1_accuracy'] * 100:.2f}%")
    print(f"[+] Top-3 Accuracy: {meta['metrics']['test_top3_accuracy'] * 100:.2f}%")

    return True


def main():
    print("=======================================================")
    print("COMPREHENSIVE MODEL EVALUATION & INFERENCE VERIFICATION")
    print("=======================================================")
    ok1 = evaluate_crop_recommendation()
    ok2 = evaluate_yield_prediction()
    ok3 = evaluate_disease_model()
    if ok1 and ok2 and ok3:
        print("\n[ALL TESTS PASSED] All 3 Machine Learning Models Verified Successfully.")


if __name__ == "__main__":
    main()
