"""
Preprocessing and Normalization Pipeline Utilities
"""
import numpy as np
import pandas as pd
from typing import Tuple, List, Dict, Any


def clean_dataframe(
    df: pd.DataFrame,
    required_columns: List[str],
    numeric_columns: List[str],
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Standardizes column names, removes exact duplicates, checks missing values,
    and returns cleaned dataframe alongside cleaning audit metrics.
    """
    initial_rows = len(df)

    # 1. Normalize column names (lowercase, stripped, underscored)
    df.columns = [c.strip().lower().replace(" ", "_").replace("-", "_") for c in df.columns]
    
    # 2. Check duplicates
    duplicate_rows = int(df.duplicated().sum())
    df = df.drop_duplicates()

    # 3. Check missing values
    missing_before = df.isnull().sum().to_dict()
    df = df.dropna(subset=[c.lower() for c in required_columns if c.lower() in df.columns])

    # 4. Enforce numeric typing
    for col in numeric_columns:
        col_norm = col.lower()
        if col_norm in df.columns:
            df[col_norm] = pd.to_numeric(df[col_norm], errors="coerce")

    # Drop any rows where numeric coercion failed
    df = df.dropna()

    final_rows = len(df)

    audit = {
        "rows_before": initial_rows,
        "rows_after": final_rows,
        "duplicates_removed": duplicate_rows,
        "missing_per_column": missing_before,
        "features": list(df.columns),
    }

    return df, audit


def detect_outliers_iqr(df: pd.DataFrame, column: str, multiplier: float = 2.5) -> pd.Series:
    """Detects severe outliers using Interquartile Range without aggressive deletion."""
    q1 = df[column].quantile(0.25)
    q3 = df[column].quantile(0.75)
    iqr = q3 - q1
    lower_bound = q1 - (multiplier * iqr)
    upper_bound = q3 + (multiplier * iqr)
    return (df[column] < lower_bound) | (df[column] > upper_bound)
