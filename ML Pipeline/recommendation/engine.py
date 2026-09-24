"""
PredictDrive — Vehicle Recommendation Engine
=============================================
Content-based filtering over data/raw/Cars_Datasets_2025.csv.
Scores every car against the customer's stated preferences and returns
a ranked list with a 0-100% match score. No training required.
"""

import re
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

from .config import COLUMNS as C, RAW_CSV_PATH, normalize_fuel, guess_body_type, build_body_type_lookup


def _parse_price(raw) -> float:
    """
    'Cars Prices' comes as things like '$1,100,000 ', '$12,000-$15,000',
    or '$460,000 '. Ranges are averaged; everything else is just cleaned
    of $ and commas.
    """
    text = str(raw).replace("$", "").replace(",", "").strip()
    parts = re.findall(r"\d+\.?\d*", text)
    if not parts:
        return np.nan
    nums = [float(p) for p in parts]
    return sum(nums) / len(nums)


def _parse_seats(raw) -> float:
    """
    'Seats' is mostly clean integers but has a handful of corrupted
    values (e.g. '215', '212', '78') that are clearly not real seat
    counts, plus combo values like '2+2'. Anything outside 1-9 is
    treated as missing and filled with the column median later.
    """
    text = str(raw)
    if "+" in text:
        parts = [float(p) for p in text.split("+") if p.strip().isdigit()]
        val = sum(parts) if parts else np.nan
    else:
        try:
            val = float(text)
        except ValueError:
            val = np.nan
    if val is not np.nan and (val < 1 or val > 9):
        return np.nan
    return val


def _parse_hp(raw) -> float:
    """'HorsePower' comes as '963 hp' or ranges like '70-85 hp'."""
    text = str(raw).replace("hp", "").strip()
    parts = re.findall(r"\d+\.?\d*", text)
    if not parts:
        return np.nan
    nums = [float(p) for p in parts]
    return sum(nums) / len(nums)


class CarRecommender:
    def __init__(self, csv_path: str = RAW_CSV_PATH):
        self.df = pd.read_csv(csv_path, encoding="latin1")
        self._clean()
        self._build_feature_matrix()

    # -------------------------------------------------------------
    def _clean(self):
        df = self.df.copy()
        df = df.dropna(subset=[C["name"], C["price"]])

        df["price_usd"] = df[C["price"]].apply(_parse_price)
        df["seats_n"] = df[C["seats"]].apply(_parse_seats)
        df["hp_n"] = df[C["hp"]].apply(_parse_hp)
        df["fuel_norm"] = df[C["fuel"]].apply(normalize_fuel)

        body_type_lookup = build_body_type_lookup()
        df["body_type"] = [
            guess_body_type(n, co, s, body_type_lookup)
            for n, co, s in zip(df[C["name"]], df[C["company"]], df[C["seats"]])
        ]

        df = df.dropna(subset=["price_usd"])
        df["seats_n"] = df["seats_n"].fillna(df["seats_n"].median())
        df["hp_n"] = df["hp_n"].fillna(df["hp_n"].median())

        self.df = df.reset_index(drop=True)

    # -------------------------------------------------------------
    def _build_feature_matrix(self):
        df = self.df

        self.numeric_cols = ["price_usd", "seats_n", "hp_n"]
        self.scaler = MinMaxScaler()
        numeric_matrix = self.scaler.fit_transform(df[self.numeric_cols])

        cat_df = pd.get_dummies(df[["body_type", "fuel_norm"]])
        self.categorical_columns = cat_df.columns.tolist()

        self.feature_matrix = np.hstack([numeric_matrix, cat_df.values.astype(float)])

    # -------------------------------------------------------------
    def _vectorize_query(self, preferences: dict) -> np.ndarray:
        """
        preferences example:
            {"body_type": "SUV", "fuel_norm": "Petrol", "seats_n": 5, "price_usd": 70000}
        Any key omitted falls back to the catalog median for that numeric
        field, or contributes no weight for categorical fields.
        """
        numeric_query = np.array(
            [[preferences.get(col, np.nan) for col in self.numeric_cols]], dtype=float
        )
        col_medians = self.df[self.numeric_cols].median().values
        nan_mask = np.isnan(numeric_query)
        numeric_query[nan_mask] = col_medians[np.where(nan_mask)[1]]
        numeric_scaled = self.scaler.transform(
            pd.DataFrame(numeric_query, columns=self.numeric_cols)
        )

        cat_vector = np.zeros((1, len(self.categorical_columns)))
        for key in ["body_type", "fuel_norm"]:
            val = preferences.get(key)
            if val is None:
                continue
            target_col = f"{key}_{val}"
            if target_col in self.categorical_columns:
                cat_vector[0, self.categorical_columns.index(target_col)] = 1

        return np.hstack([numeric_scaled, cat_vector])

    # -------------------------------------------------------------
    def recommend(self, preferences: dict, top_n: int = 5) -> pd.DataFrame:
        query_vector = self._vectorize_query(preferences)

        catalog = self.feature_matrix
        dot = catalog @ query_vector.T
        catalog_norms = np.linalg.norm(catalog, axis=1, keepdims=True)
        query_norm = np.linalg.norm(query_vector)
        similarity = (dot / (catalog_norms * query_norm + 1e-9)).flatten()

        results = self.df.copy()
        results["match_score"] = np.round(similarity * 100, 1)
        results = results.sort_values("match_score", ascending=False).head(top_n)

        display_cols = [
            C["company"], C["name"], "body_type", "fuel_norm",
            "seats_n", "hp_n", "price_usd", "match_score",
        ]
        return results[display_cols].reset_index(drop=True)


if __name__ == "__main__":
    engine = CarRecommender()
    print(f"Loaded {len(engine.df)} cars after cleaning.\n")

    preferences = {"body_type": "SUV", "fuel_norm": "Petrol", "seats_n": 5, "price_usd": 60000}
    print(engine.recommend(preferences, top_n=5).to_string(index=False))
