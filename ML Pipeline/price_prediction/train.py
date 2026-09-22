"""
PredictDrive — Rental Price Model Training
=============================================
Trains a regression model on real rental fares (rate.daily) and saves
it to models/price_model.pkl. Run this once (or whenever the dataset
changes) — the API just loads the saved model at startup.

Run:
    python -m price_prediction.train
"""

import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

from .config import NUMERIC_FEATURES, CATEGORICAL_FEATURES, TARGET, MODEL_PATH
from .preprocess import load_and_clean


def build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", "passthrough", NUMERIC_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ]
    )
    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=14,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    return Pipeline([("preprocess", preprocessor), ("model", model)])


def main():
    df = load_and_clean()
    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    preds = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)

    print(f"Test MAE:  ${mae:.2f} / day")
    print(f"Test R^2:  {r2:.3f}")
    print(f"(baseline: predicting the mean fare every time would give "
          f"MAE ~${np.abs(y_test - y_train.mean()).mean():.2f})")

    joblib.dump(pipeline, MODEL_PATH)
    print(f"Saved trained model to {MODEL_PATH}")


if __name__ == "__main__":
    main()
