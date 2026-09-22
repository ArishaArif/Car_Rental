"""
PredictDrive — Rental Price Inference
=========================================
Loads the model trained by train.py and exposes a simple predict()
function. This is what the API imports — it never retrains at request
time.
"""

import joblib
import pandas as pd

from .config import MODEL_PATH, NUMERIC_FEATURES, CATEGORICAL_FEATURES


class PricePredictor:
    def __init__(self, model_path: str = MODEL_PATH):
        self.pipeline = joblib.load(model_path)

    def predict(self, car: dict) -> float:
        """
        car example:
            {
                "vehicle.year": 2021,
                "rating": 4.9,
                "renterTripsTaken": 15,
                "reviewCount": 12,
                "vehicle.make": "Toyota",
                "vehicle.type": "suv",
                "fuelType": "GASOLINE",
                "location.state": "CA",
            }
        Any missing field falls back to a reasonable default so the
        endpoint doesn't crash on a partially-filled form.
        """
        defaults = {
            "vehicle.year": 2018,
            "rating": 4.8,
            "renterTripsTaken": 5,
            "reviewCount": 3,
            "vehicle.make": "Toyota",
            "vehicle.type": "car",
            "fuelType": "GASOLINE",
            "location.state": "CA",
        }
        row = {**defaults, **car}
        X = pd.DataFrame([row])[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
        return float(self.pipeline.predict(X)[0])


if __name__ == "__main__":
    predictor = PricePredictor()
    example = {
        "vehicle.year": 2022,
        "rating": 4.95,
        "renterTripsTaken": 30,
        "reviewCount": 25,
        "vehicle.make": "Tesla",
        "vehicle.type": "suv",
        "fuelType": "ELECTRIC",
        "location.state": "WA",
    }
    print(f"Predicted daily rate: ${predictor.predict(example):.2f}")
