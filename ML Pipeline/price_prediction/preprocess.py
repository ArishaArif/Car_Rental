"""
PredictDrive — Rental Price Data Cleaning
===========================================
Cleans data/raw/CarRentalData.csv ready for training.
"""

import pandas as pd
from .config import RAW_CSV_PATH, TARGET, NUMERIC_FEATURES, CATEGORICAL_FEATURES


def load_and_clean(csv_path: str = RAW_CSV_PATH) -> pd.DataFrame:
    df = pd.read_csv(csv_path, encoding="latin1")

    # Drop rows with no target — can't train or evaluate on these
    df = df.dropna(subset=[TARGET])

    # rating and fuelType have some missing values (see inspection):
    # rating -> fill with median (renter ratings cluster tightly near 5)
    # fuelType -> fill with the most common category rather than drop rows
    df["rating"] = df["rating"].fillna(df["rating"].median())
    df["fuelType"] = df["fuelType"].fillna(df["fuelType"].mode()[0])

    # Guard against div-by-zero / negative fares slipping through
    df = df[df[TARGET] > 0]

    keep_cols = NUMERIC_FEATURES + CATEGORICAL_FEATURES + [TARGET]
    return df[keep_cols].reset_index(drop=True)


if __name__ == "__main__":
    cleaned = load_and_clean()
    print(cleaned.shape)
    print(cleaned.head())
    cleaned.to_csv("data/processed/rental_cleaned.csv", index=False)
    print("Saved to data/processed/rental_cleaned.csv")
