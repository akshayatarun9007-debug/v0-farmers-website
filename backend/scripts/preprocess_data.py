"""
Data Preprocessing and Validation Pipeline (Phase D)
- Clean, validate, and audit Crop Recommendation dataset
- Clean, validate, and audit Crop Production & Yield dataset
- Index and prepare authentic PlantVillage image dataset
- Enforce data hygiene and prevent data leakage
"""

import os
import json
from pathlib import Path
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def preprocess_crop_recommendation():
    print("\n==================================================")
    print("PREPROCESSING CROP RECOMMENDATION DATASET")
    print("==================================================")
    raw_path = RAW_DIR / "crop_recommendation.csv"
    if not raw_path.exists():
        raise FileNotFoundError(f"Missing raw crop recommendation data at {raw_path}")

    df = pd.read_csv(raw_path)
    initial_rows = len(df)
    print(f"[*] Initial raw rows: {initial_rows}")

    # 1. Normalize column names
    df.columns = [c.strip().lower() for c in df.columns]
    print(f"[*] Columns: {list(df.columns)}")

    # 2. Check missing values
    missing_counts = df.isnull().sum().to_dict()
    print(f"[*] Missing values per column: {missing_counts}")

    # 3. Check duplicate rows
    dups = int(df.duplicated().sum())
    print(f"[*] Duplicate rows: {dups}")
    if dups > 0:
        df = df.drop_duplicates()

    # 4. Check agricultural boundaries
    # N: 0-300, P: 0-200, K: 0-300, temp: -10 to 60, humidity: 0 to 100, ph: 0 to 14, rainfall: 0 to 5000
    valid_mask = (
        (df["n"] >= 0) & (df["n"] <= 300) &
        (df["p"] >= 0) & (df["p"] <= 200) &
        (df["k"] >= 0) & (df["k"] <= 300) &
        (df["temperature"] >= -10) & (df["temperature"] <= 60) &
        (df["humidity"] >= 0) & (df["humidity"] <= 100) &
        (df["ph"] >= 0) & (df["ph"] <= 14) &
        (df["rainfall"] >= 0) & (df["rainfall"] <= 5000)
    )
    invalid_rows = int((~valid_mask).sum())
    print(f"[*] Out-of-bounds / impossible rows detected: {invalid_rows}")
    df = df[valid_mask]

    # 5. Clean labels
    df["label"] = df["label"].astype(str).str.strip().str.lower()
    crop_counts = df["label"].value_counts().to_dict()
    print(f"[*] Unique crop classes: {len(crop_counts)} (100 samples per class expected)")

    cleaned_rows = len(df)
    print(f"[+] Final cleaned rows: {cleaned_rows}")

    # Save cleaned file & audit
    out_csv = PROCESSED_DIR / "crop_recommendation_cleaned.csv"
    df.to_csv(out_csv, index=False)

    audit = {
        "dataset_name": "ICAR Crop Recommendation Dataset",
        "rows_before": initial_rows,
        "rows_after": cleaned_rows,
        "duplicates_removed": dups,
        "missing_values": missing_counts,
        "invalid_boundary_rows_removed": invalid_rows,
        "features": ["n", "p", "k", "temperature", "humidity", "ph", "rainfall"],
        "target": "label",
        "num_classes": len(crop_counts),
        "class_distribution": crop_counts,
    }

    audit_path = PROCESSED_DIR / "crop_recommendation_audit.json"
    with open(audit_path, "w", encoding="utf-8") as f:
        json.dump(audit, f, indent=2)

    print(f"[+] Cleaned dataset saved to: {out_csv}")
    print(f"[+] Audit metrics saved to: {audit_path}")
    return audit


def preprocess_crop_yield():
    print("\n==================================================")
    print("PREPROCESSING CROP PRODUCTION & YIELD DATASET")
    print("==================================================")
    raw_path = RAW_DIR / "crop_production.csv"
    if not raw_path.exists():
        raise FileNotFoundError(f"Missing raw crop production data at {raw_path}")

    df = pd.read_csv(raw_path)
    initial_rows = len(df)
    print(f"[*] Initial raw rows: {initial_rows}")

    # 1. Normalize column names
    rename_map = {
        "State_Name": "state",
        "District_Name": "district",
        "Crop_Year": "crop_year",
        "Season": "season",
        "Crop": "crop",
        "Area": "area_ha",
        "Production": "production_tonnes",
    }
    df = df.rename(columns=rename_map)

    # 2. Check and clean missing values
    missing_counts = {k: int(v) for k, v in df.isnull().sum().to_dict().items()}
    print(f"[*] Missing values before cleaning: {missing_counts}")
    
    # Official dataset has missing Production where crops were damaged/not recorded
    df = df.dropna(subset=["production_tonnes", "area_ha"])
    rows_after_dropna = len(df)
    print(f"[*] Rows after dropping unrecorded production: {rows_after_dropna}")

    # 3. Check and clean duplicates
    dups = int(df.duplicated().sum())
    print(f"[*] Duplicate rows: {dups}")
    if dups > 0:
        df = df.drop_duplicates()

    # 4. Clean text strings (strip whitespace, standardize cases)
    for col in ["state", "district", "season", "crop"]:
        df[col] = df[col].astype(str).str.strip()

    # 5. Remove non-sensical records (area <= 0 or production < 0)
    valid_records = (df["area_ha"] > 0) & (df["production_tonnes"] >= 0)
    df = df[valid_records]
    print(f"[*] Rows after removing non-positive area: {len(df)}")

    # 6. Calculate target: Yield = Production / Area (tonnes per hectare)
    df["yield_tonnes_per_ha"] = df["production_tonnes"] / df["area_ha"]

    # 7. Audit and handle unit anomalies and extreme reporting outliers
    # In official Indian records, Coconut production was occasionally recorded in 'Nuts' rather than 'Tonnes',
    # leading to artificial yield numbers in the thousands.
    # Standard agricultural yield boundaries:
    # - Grain/Pulse/Oilseed crops: typical yield 0.2 to 12 tonnes/ha
    # - Sugarcane: typical yield 30 to 120 tonnes/ha
    # We filter out non-sensical records where yield > 150 tonnes/ha.
    extreme_outliers = (df["yield_tonnes_per_ha"] > 150)
    print(f"[*] Unit reporting anomalies / extreme outliers (yield > 150 tonnes/ha): {int(extreme_outliers.sum())}")
    df = df[~extreme_outliers]

    # 8. Sort chronologically by crop_year to prevent data leakage in time-aware evaluation
    df = df.sort_values(by=["crop_year", "state", "district"]).reset_index(drop=True)

    cleaned_rows = len(df)
    print(f"[+] Final cleaned rows: {cleaned_rows}")
    print(f"[*] Year range: {df['crop_year'].min()} to {df['crop_year'].max()}")
    print(f"[*] Top crops represented: {list(df['crop'].value_counts().head(10).index)}")

    out_csv = PROCESSED_DIR / "crop_yield_cleaned.csv"
    df.to_csv(out_csv, index=False)

    audit = {
        "dataset_name": "Government of India Ministry of Agriculture Crop Production Statistics",
        "rows_before": initial_rows,
        "rows_after": cleaned_rows,
        "duplicates_removed": dups,
        "missing_values_dropped": missing_counts,
        "outlier_anomalies_removed": int(extreme_outliers.sum()),
        "year_min": int(df["crop_year"].min()),
        "year_max": int(df["crop_year"].max()),
        "features": ["state", "district", "crop_year", "season", "crop", "area_ha"],
        "target": "yield_tonnes_per_ha",
        "mean_yield": round(float(df["yield_tonnes_per_ha"].mean()), 3),
        "median_yield": round(float(df["yield_tonnes_per_ha"].median()), 3),
    }

    audit_path = PROCESSED_DIR / "crop_yield_audit.json"
    with open(audit_path, "w", encoding="utf-8") as f:
        json.dump(audit, f, indent=2)

    print(f"[+] Cleaned dataset saved to: {out_csv}")
    print(f"[+] Audit metrics saved to: {audit_path}")
    return audit


def preprocess_plantvillage_dataset():
    print("\n==================================================")
    print("PREPROCESSING PLANTVILLAGE DISEASE DATASET")
    print("==================================================")
    pv_dir = RAW_DIR / "plantvillage"
    if not pv_dir.exists():
        raise FileNotFoundError(f"PlantVillage directory missing at {pv_dir}")

    records = []
    class_folders = [f for f in pv_dir.iterdir() if f.is_dir()]

    for folder in sorted(class_folders):
        cls_name = folder.name
        # Format crop and disease components
        parts = cls_name.split("___")
        crop = parts[0].replace("_", " ").replace("(", "").replace(")", "").strip()
        disease = parts[1].replace("_", " ").strip() if len(parts) > 1 else "Healthy"
        is_healthy = "healthy" in disease.lower()

        img_files = list(folder.glob("*.jpg")) + list(folder.glob("*.JPG"))
        for img_path in img_files:
            rel_path = str(img_path.relative_to(BASE_DIR)).replace("\\", "/")
            records.append({
                "class_name": cls_name,
                "crop": crop,
                "disease": disease,
                "is_healthy": is_healthy,
                "image_path": rel_path,
                "file_name": img_path.name,
            })

    print(f"[+] Indexed {len(records)} authentic images across {len(class_folders)} classes.")
    
    index_path = PROCESSED_DIR / "disease_dataset_index.json"
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    print(f"[+] Disease dataset index saved to: {index_path}")
    return {"total_images": len(records), "classes": [f.name for f in class_folders]}


def main():
    print("STARTING DATA PREPROCESSING & AUDITING PIPELINE (PHASE D)")
    audit_rec = preprocess_crop_recommendation()
    audit_yield = preprocess_crop_yield()
    audit_pv = preprocess_plantvillage_dataset()
    print("\n[SUCCESS] Phase D data preprocessing completed successfully with full audit records.")


if __name__ == "__main__":
    main()
