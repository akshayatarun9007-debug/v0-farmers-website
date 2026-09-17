"""
Model Training and Evaluation Pipeline (Phases E, F, G)
- Model 1: Multi-Crop Recommendation Classifier (Random Forest vs Gradient Boosting vs Logistic Regression)
- Model 2: Time-Aware Crop Yield Prediction Regressor (Ridge vs Random Forest vs Gradient Boosting)
- Model 3: Crop Disease Image Classifier & Pathogen Diagnostic Engine
"""

import os
import json
import time
from pathlib import Path
import numpy as np
import pandas as pd
from PIL import Image
import joblib

from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, mean_absolute_error, mean_squared_error, r2_score

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
MODELS_DIR = BASE_DIR / "models"

MODELS_DIR.mkdir(parents=True, exist_ok=True)
(MODELS_DIR / "crop_recommendation").mkdir(parents=True, exist_ok=True)
(MODELS_DIR / "yield_prediction").mkdir(parents=True, exist_ok=True)
(MODELS_DIR / "disease_detection").mkdir(parents=True, exist_ok=True)


# =====================================================================
# PHASE E: CROP RECOMMENDATION MODEL TRAINING
# =====================================================================
def train_crop_recommendation():
    print("\n=======================================================")
    print("PHASE E: TRAINING CROP RECOMMENDATION MODELS")
    print("=======================================================")
    data_file = PROCESSED_DIR / "crop_recommendation_cleaned.csv"
    df = pd.read_csv(data_file)
    print(f"[*] Loaded cleaned crop data: {df.shape[0]} rows, {df.shape[1]} columns")

    feature_cols = ["n", "p", "k", "temperature", "humidity", "ph", "rainfall"]
    target_col = "label"

    X = df[feature_cols]
    y = df[target_col]

    # Stratified 80/20 train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[*] Train set: {len(X_train)} samples | Test set: {len(X_test)} samples")

    candidates = {
        "RandomForest": RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42),
        "GradientBoosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, random_state=42),
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42),
    }

    results = {}
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    for name, clf in candidates.items():
        pipe = Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", clf),
        ])
        cv_scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring="accuracy")
        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_test)
        
        acc = float(accuracy_score(y_test, preds))
        f1_w = float(f1_score(y_test, preds, average="weighted"))
        f1_macro = float(f1_score(y_test, preds, average="macro"))
        prec = float(precision_score(y_test, preds, average="weighted", zero_division=0))
        rec = float(recall_score(y_test, preds, average="weighted", zero_division=0))

        results[name] = {
            "cv_accuracy_mean": round(float(np.mean(cv_scores)), 4),
            "cv_accuracy_std": round(float(np.std(cv_scores)), 4),
            "test_accuracy": round(acc, 4),
            "test_precision": round(prec, 4),
            "test_recall": round(rec, 4),
            "test_f1_weighted": round(f1_w, 4),
            "test_f1_macro": round(f1_macro, 4),
            "pipeline": pipe,
        }
        print(f"  -> {name:<20}: CV Acc: {results[name]['cv_accuracy_mean']:.4f} | Test Acc: {acc:.4f} | F1: {f1_w:.4f}")

    # Select best model based on test F1 weighted
    best_name = max(results, key=lambda k: results[k]["test_f1_weighted"])
    best_model = results[best_name]["pipeline"]
    print(f"\n[+] Selected superior model: {best_name} (Test Accuracy: {results[best_name]['test_accuracy'] * 100:.2f}%)")

    # Save trained model artifact
    save_path = MODELS_DIR / "crop_recommendation" / "model.joblib"
    joblib.dump(best_model, save_path)
    print(f"[+] Saved model artifact to: {save_path}")

    # Save model metadata
    metadata = {
        "model_name": "Crop Recommendation Classifier",
        "algorithm": best_name,
        "version": "1.0.0",
        "trained_on": time.strftime("%Y-%m-%d %H:%M:%S"),
        "dataset": "ICAR / Indian Agro-Climatic Soil-Crop Dataset (22 Crops)",
        "features": feature_cols,
        "target": target_col,
        "metrics": {
            "test_accuracy": results[best_name]["test_accuracy"],
            "test_precision": results[best_name]["test_precision"],
            "test_recall": results[best_name]["test_recall"],
            "test_f1_weighted": results[best_name]["test_f1_weighted"],
            "test_f1_macro": results[best_name]["test_f1_macro"],
            "cv_accuracy_mean": results[best_name]["cv_accuracy_mean"],
        },
        "model_comparison": {k: {m: results[k][m] for m in results[k] if m != "pipeline"} for k in results},
        "classes": sorted(list(y.unique())),
        "limitations": "Trained on optimal agro-climatic envelopes. In field practice, always evaluate against soil moisture and local pest history.",
    }

    meta_path = MODELS_DIR / "crop_recommendation" / "metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[+] Saved metadata to: {meta_path}")

    return metadata


# =====================================================================
# PHASE F: CROP YIELD PREDICTION MODEL TRAINING (TIME-AWARE SPLIT)
# =====================================================================
def train_crop_yield_prediction():
    print("\n=======================================================")
    print("PHASE F: TRAINING CROP YIELD REGRESSION MODELS")
    print("=======================================================")
    data_file = PROCESSED_DIR / "crop_yield_cleaned.csv"
    df = pd.read_csv(data_file)
    print(f"[*] Loaded cleaned yield records: {len(df)} rows")

    # Time-Aware Split to Prevent Temporal Data Leakage:
    # Train on historical years <= 2013 (80%+ of timeline)
    # Test on held-out years 2014-2015
    train_mask = df["crop_year"] <= 2013
    test_mask = df["crop_year"] > 2013

    train_df = df[train_mask]
    test_df = df[test_mask]

    print(f"[*] Time-aware split: Train records (1997-2013): {len(train_df)} | Test records (2014-2015): {len(test_df)}")

    # To keep model fast, accurate, and memory-conscious in development,
    # sample representative subsets across states and crops
    if len(train_df) > 50000:
        train_sample = train_df.sample(n=50000, random_state=42)
    else:
        train_sample = train_df
    
    if len(test_df) > 12000:
        test_sample = test_df.sample(n=12000, random_state=42)
    else:
        test_sample = test_df

    cat_cols = ["state", "season", "crop"]
    num_cols = ["area_ha", "crop_year"]
    target_col = "yield_tonnes_per_ha"

    X_train = train_sample[cat_cols + num_cols]
    y_train = train_sample[target_col]

    X_test = test_sample[cat_cols + num_cols]
    y_test = test_sample[target_col]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
            ("num", StandardScaler(), num_cols),
        ]
    )

    candidates = {
        "Ridge": Ridge(alpha=10.0),
        "RandomForestRegressor": RandomForestRegressor(n_estimators=50, max_depth=16, n_jobs=-1, random_state=42),
        "GradientBoostingRegressor": GradientBoostingRegressor(n_estimators=60, max_depth=6, random_state=42),
    }

    results = {}

    for name, reg in candidates.items():
        pipe = Pipeline([
            ("preprocessor", preprocessor),
            ("regressor", reg),
        ])
        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_test)
        # Ensure yield is non-negative
        preds = np.clip(preds, 0, None)

        mae = float(mean_absolute_error(y_test, preds))
        mse = float(mean_squared_error(y_test, preds))
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_test, preds))

        results[name] = {
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "r2_score": round(r2, 4),
            "pipeline": pipe,
            "residuals_std": round(float(np.std(y_test - preds)), 4),
        }
        print(f"  -> {name:<26}: MAE: {mae:.4f} | RMSE: {rmse:.4f} | R²: {r2:.4f}")

    # Select best model based on R2 score (or lowest RMSE)
    best_name = max(results, key=lambda k: results[k]["r2_score"])
    best_pipe = results[best_name]["pipeline"]
    print(f"\n[+] Selected superior yield model: {best_name} (R²: {results[best_name]['r2_score']:.4f})")

    # Save pipeline
    save_path = MODELS_DIR / "yield_prediction" / "model.joblib"
    joblib.dump(best_pipe, save_path)
    print(f"[+] Saved yield model artifact to: {save_path}")

    # Calculate historical benchmarks per crop for contextual comparison in frontend
    crop_benchmarks = (
        df.groupby("crop")["yield_tonnes_per_ha"]
        .agg(["mean", "min", "max", "std", "count"])
        .reset_index()
    )
    crop_benchmarks = crop_benchmarks[crop_benchmarks["count"] >= 20]
    benchmarks_dict = {}
    for _, row in crop_benchmarks.iterrows():
        benchmarks_dict[row["crop"]] = {
            "mean": round(float(row["mean"]), 2),
            "min": round(float(row["min"]), 2),
            "max": round(float(row["max"]), 2),
            "std": round(float(row["std"]) if pd.notnull(row["std"]) else 0.5, 2),
            "sample_count": int(row["count"]),
        }

    bench_path = MODELS_DIR / "yield_prediction" / "crop_benchmarks.json"
    with open(bench_path, "w", encoding="utf-8") as f:
        json.dump(benchmarks_dict, f, indent=2)

    metadata = {
        "model_name": "Crop Yield Predictor",
        "algorithm": best_name,
        "version": "1.0.0",
        "trained_on": time.strftime("%Y-%m-%d %H:%M:%S"),
        "dataset": "Ministry of Agriculture & Farmers Welfare, GoI (241,324 cleaned records)",
        "features": cat_cols + num_cols,
        "target": target_col,
        "unit": "tonnes/hectare",
        "metrics": {
            "mae": results[best_name]["mae"],
            "rmse": results[best_name]["rmse"],
            "r2_score": results[best_name]["r2_score"],
            "residuals_std": results[best_name]["residuals_std"],
        },
        "model_comparison": {k: {m: results[k][m] for m in results[k] if m != "pipeline"} for k in results},
        "time_aware_split": {
            "train_years": "1997 - 2013",
            "test_years": "2014 - 2015",
            "leakage_prevention": "Strict temporal separation. No future season data exposed to training pipeline.",
        },
    }

    meta_path = MODELS_DIR / "yield_prediction" / "metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[+] Saved yield metadata to: {meta_path}")

    return metadata


# =====================================================================
# PHASE G: CROP DISEASE DETECTION & SYMPTOM RISK ENGINE
# =====================================================================
def extract_leaf_image_features(image_path: Path) -> np.ndarray:
    """
    Extracts authentic color and texture descriptors from a plant leaf image.
    Computes normalized RGB channel means, standard deviations, and HSV color histograms.
    """
    img = Image.open(image_path).convert("RGB").resize((128, 128))
    arr = np.array(img, dtype=np.float32) / 255.0

    # Color means and stds per channel
    r_mean, g_mean, b_mean = np.mean(arr[:, :, 0]), np.mean(arr[:, :, 1]), np.mean(arr[:, :, 2])
    r_std, g_std, b_std = np.std(arr[:, :, 0]), np.std(arr[:, :, 1]), np.std(arr[:, :, 2])

    # Green-to-Red vegetative health ratio
    green_index = (g_mean - r_mean) / (g_mean + r_mean + 1e-6)

    # Color histograms (16 bins per channel)
    hist_r, _ = np.histogram(arr[:, :, 0], bins=16, range=(0, 1), density=True)
    hist_g, _ = np.histogram(arr[:, :, 1], bins=16, range=(0, 1), density=True)
    hist_b, _ = np.histogram(arr[:, :, 2], bins=16, range=(0, 1), density=True)

    features = np.concatenate([
        [r_mean, g_mean, b_mean, r_std, g_std, b_std, green_index],
        hist_r, hist_g, hist_b,
    ])
    return features


def train_disease_model():
    print("\n=======================================================")
    print("PHASE G: TRAINING CROP DISEASE DETECTION MODEL")
    print("=======================================================")
    index_file = PROCESSED_DIR / "disease_dataset_index.json"
    with open(index_file, "r", encoding="utf-8") as f:
        records = json.load(f)

    print(f"[*] Extracting authentic visual features for {len(records)} PlantVillage leaf images...")
    X_features = []
    y_labels = []

    for r in records:
        img_full_path = BASE_DIR / r["image_path"]
        if img_full_path.exists():
            feat = extract_leaf_image_features(img_full_path)
            X_features.append(feat)
            y_labels.append(r["class_name"])

    X = np.array(X_features)
    y = np.array(y_labels)
    classes = sorted(list(np.unique(y)))
    print(f"[*] Extracted feature matrix shape: {X.shape}, Classes: {len(classes)}")

    # Stratified split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(n_estimators=80, max_depth=12, random_state=42)
    clf.fit(X_train, y_train)

    train_preds = clf.predict(X_train)
    test_preds = clf.predict(X_test)
    test_probs = clf.predict_proba(X_test)

    acc = float(accuracy_score(y_test, test_preds))
    f1 = float(f1_score(y_test, test_preds, average="weighted", zero_division=0))

    # Calculate Top-3 accuracy
    top3_correct = 0
    for i, true_label in enumerate(y_test):
        top3_indices = np.argsort(test_probs[i])[-3:][::-1]
        top3_classes = [clf.classes_[idx] for idx in top3_indices]
        if true_label in top3_classes:
            top3_correct += 1
    top3_acc = float(top3_correct / len(y_test))

    print(f"[+] Disease Detection Model: Test Top-1 Accuracy: {acc * 100:.2f}% | Top-3 Accuracy: {top3_acc * 100:.2f}% | F1: {f1:.4f}")

    # Save model and classes
    model_artifact = {
        "classifier": clf,
        "classes": list(clf.classes_),
        "feature_extractor": "leaf_color_and_vegetation_moments_v1",
    }
    save_path = MODELS_DIR / "disease_detection" / "model.joblib"
    joblib.dump(model_artifact, save_path)
    print(f"[+] Saved disease model to: {save_path}")

    # Authoritative pathology advisories
    disease_advisories = {
        "Tomato___healthy": {
            "disease_name": "Healthy Foliage",
            "is_healthy": True,
            "explanation": "Leaves exhibit normal green coloration with active chlorophyll and no signs of bacterial or fungal lesions.",
            "recommended_action": "Maintain routine balanced irrigation, balanced N-P-K fertigation, and regular scouting.",
        },
        "Tomato___Early_blight": {
            "disease_name": "Early Blight (Alternaria solani)",
            "is_healthy": False,
            "explanation": "Fungal pathogen characterized by concentric target-like brown spots surrounded by yellow chlorotic halos on older lower leaves.",
            "recommended_action": "Remove and destroy affected lower foliage. Avoid overhead sprinkler irrigation. Apply ICAR-approved bio-fungicides (Trichoderma harzianum) or Mancozeb as per agricultural officer guidelines.",
        },
        "Tomato___Late_blight": {
            "disease_name": "Late Blight (Phytophthora infestans)",
            "is_healthy": False,
            "explanation": "Severe fungal-like oomycete infection thriving under high humidity and cool temperatures. Water-soaked dark lesions spreading rapidly across leaves and stems.",
            "recommended_action": "Urgent intervention required. Destroy infected plant debris immediately. Improve air circulation. Spray copper oxychloride (0.25%) or metalaxyl upon professional confirmation.",
        },
        "Potato___healthy": {
            "disease_name": "Healthy Foliage",
            "is_healthy": True,
            "explanation": "Normal vegetative leaf canopy showing uniform green pigmentation and robust leaf architecture.",
            "recommended_action": "Continue earthing-up and preventive scouting. Maintain optimal soil moisture for tuber bulking.",
        },
        "Potato___Early_blight": {
            "disease_name": "Early Blight (Alternaria solani)",
            "is_healthy": False,
            "explanation": "Brown angular spots with concentric rings appearing on older leaves, often exacerbated by nitrogen deficiency and drought stress.",
            "recommended_action": "Apply balanced potassium and nitrogen fertilizers. Treat with approved protectant fungicides at first sign of circular lesions.",
        },
        "Potato___Late_blight": {
            "disease_name": "Late Blight (Phytophthora infestans)",
            "is_healthy": False,
            "explanation": "Devastating foliar disease causing pale green to brown water-soaked lesions with white mildew growth on leaf undersides in humid conditions.",
            "recommended_action": "Halt overhead irrigation immediately. Spray systemic fungicide (e.g. cymoxanil or metalaxyl-mancozeb). Monitor nearby potato/tomato fields.",
        },
        "Corn_(maize)___healthy": {
            "disease_name": "Healthy Maize Leaf",
            "is_healthy": True,
            "explanation": "Vibrant green parallel-veined leaves showing healthy photosynthetic activity with no rust pustules.",
            "recommended_action": "Ensure adequate nitrogen side-dressing during knee-high to tasseling stages.",
        },
        "Corn_(maize)___Common_rust_": {
            "disease_name": "Common Rust (Puccinia sorghi)",
            "is_healthy": False,
            "explanation": "Air-borne fungal disease characterized by cinnamon-brown to golden powdery pustules scattered on both leaf surfaces.",
            "recommended_action": "Plant rust-resistant hybrid cultivars. If pustule coverage exceeds 10% on ear leaf before silking, apply recommended triazole or strobilurin fungicide.",
        },
    }

    advisory_path = MODELS_DIR / "disease_detection" / "pathology_advisories.json"
    with open(advisory_path, "w", encoding="utf-8") as f:
        json.dump(disease_advisories, f, indent=2)

    metadata = {
        "model_name": "Plant Leaf Disease Classifier & Diagnostic Engine",
        "algorithm": "Visual Feature Extractor + Random Forest Classifier & ICAR Pathology Profiles",
        "version": "1.0.0",
        "trained_on": time.strftime("%Y-%m-%d %H:%M:%S"),
        "dataset": "PlantVillage Benchmark Crop Disease Dataset (Penn State/EPFL)",
        "num_classes": len(classes),
        "classes": classes,
        "metrics": {
            "test_top1_accuracy": round(acc, 4),
            "test_top3_accuracy": round(top3_acc, 4),
            "test_f1_score": round(f1, 4),
        },
        "limitations": "Model assesses leaf surface color/morphology under benchmark conditions. Field-taken pictures with strong shadows or extreme reflections should be cross-verified by local Krishi Vigyan Kendra (KVK) officers.",
    }

    meta_path = MODELS_DIR / "disease_detection" / "metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[+] Saved disease metadata to: {meta_path}")

    return metadata


def main():
    print("==================================================")
    print("STARTING MACHINE LEARNING MODEL TRAINING PIPELINE")
    print("==================================================")
    
    # Phase E: Crop Recommendation
    rec_meta = train_crop_recommendation()
    
    # Phase F: Yield Prediction
    yield_meta = train_crop_yield_prediction()
    
    # Phase G: Disease Detection
    disease_meta = train_disease_model()

    print("\n==================================================")
    print("ALL MODELS TRAINED AND SAVED SUCCESSFULLY")
    print("==================================================")


if __name__ == "__main__":
    main()
