"""
Column map for data/raw/CarRentalData.csv (the Cornell rental dataset).

Verified directly against the file you uploaded. rate.daily is the real
rental fare and is used as the model's target — not a resale price.
"""

RAW_CSV_PATH = "data/raw/CarRentalData.csv"
PROCESSED_CSV_PATH = "data/processed/rental_cleaned.csv"
MODEL_PATH = "models/price_model.pkl"

TARGET = "rate.daily"

NUMERIC_FEATURES = [
    "vehicle.year",
    "rating",
    "renterTripsTaken",
    "reviewCount",
]

CATEGORICAL_FEATURES = [
    "vehicle.make",
    "vehicle.type",     # suv / car / truck / minivan / van
    "fuelType",          # GASOLINE / ELECTRIC / HYBRID / DIESEL
    "location.state",
]

ALL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES
