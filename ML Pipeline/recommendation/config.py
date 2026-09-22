"""
Column map for data/raw/Cars_Datasets_2025.csv

Verified directly against the file you uploaded — these are the exact
headers, not guesses. If you re-download a newer copy from Kaggle and
the headers change, this is the only file you need to edit.
"""

RAW_CSV_PATH = "data/raw/Cars_Datasets_2025.csv"
PROCESSED_CSV_PATH = "data/processed/cars_cleaned.csv"

COLUMNS = {
    "company": "Company Names",
    "name": "Cars Names",
    "engine": "Engines",
    "capacity": "CC/Battery Capacity",
    "hp": "HorsePower",
    "top_speed": "Total Speed",
    "accel": "Performance(0 - 100 )KM/H",
    "price": "Cars Prices",
    "fuel": "Fuel Types",
    "seats": "Seats",
    "torque": "Torque",
}

# The raw file has no "Body Type" column at all, and Fuel Types has ~20
# messy variants (e.g. "Petrol, Hybrid", "Hybrid (Gas + Electric)").
# These maps normalize both down to something a UI dropdown can use.

FUEL_TYPE_MAP = {
    # raw value (lowercased) -> normalized bucket
    "petrol": "Petrol",
    "diesel": "Diesel",
    "hybrid": "Hybrid",
    "electric": "Electric",
    "hydrogen": "Hydrogen",
}


def normalize_fuel(raw_value: str) -> str:
    """Collapses messy fuel strings like 'Petrol, Hybrid' or
    'Hybrid (Gas + Electric)' into one primary bucket."""
    text = str(raw_value).lower()
    if "electric" in text and "hybrid" not in text and "plug" not in text:
        return "Electric"
    if "hybrid" in text or "plug" in text:
        return "Hybrid"
    if "hydrogen" in text:
        return "Hydrogen"
    if "diesel" in text and "petrol" not in text:
        return "Diesel"
    if "petrol" in text or "gas" in text:
        return "Petrol"
    return "Other"


def guess_body_type(name: str, seats) -> str:
    """
    There is no Body Type column in this dataset at all, so this is a
    genuine (imperfect) fallback: keyword match on the car name, then
    a seat-count heuristic as a last resort. Good enough for a class
    project demo; call this out to your mentor as a known limitation
    rather than presenting it as ground truth.
    """
    text = str(name).lower()
    if any(k in text for k in ["suv", "tucson", "sportage", "cr-v", "rav4",
                                "creta", "fortuner", "x5", "x3", "q5", "q7",
                                "glc", "gle", "range rover", "defender"]):
        return "SUV"
    if any(k in text for k in ["truck", "hilux", "ranger", "pickup", "f-150", "silverado"]):
        return "Truck"
    if any(k in text for k in ["van", "hiace", "caravan", "sprinter"]):
        return "Van"
    if any(k in text for k in ["hatch", "swift", "i10", "picanto", "polo", "fit", "ka+"]):
        return "Hatchback"
    try:
        if float(str(seats).split("+")[0]) >= 6:
            return "SUV"
    except (ValueError, TypeError):
        pass
    return "Sedan"
