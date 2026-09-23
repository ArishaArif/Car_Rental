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


def guess_body_type_from_keywords(name: str, seats) -> str | None:
    """
    Keyword match on the car name, then a seat-count heuristic.
    Returns None (not "Sedan") when nothing matches — the caller
    decides what to do with an unresolved case rather than this
    function silently guessing wrong.
    """
    text = str(name).lower()
    if any(k in text for k in ["suv", "tucson", "sportage", "cr-v", "rav4",
                                "creta", "fortuner", "x5", "x3", "q5", "q7",
                                "glc", "gle", "range rover", "defender"]):
        return "SUV"
    if any(k in text for k in ["truck", "hilux", "ranger", "pickup", "f-150",
                                "silverado", "titan", "sierra", "tundra", "ram "]):
        return "Truck"
    if any(k in text for k in ["van", "hiace", "caravan", "sprinter"]):
        return "Van"
    if any(k in text for k in ["hatch", "swift", "i10", "picanto", "polo", "fit", "ka+"]):
        return "Hatchback"
    if any(k in text for k in ["sedan", "corolla", "civic", "camry", "accord",
                                "altima", "jetta", "passat", "model 3", "model s"]):
        return "Sedan"
    try:
        if float(str(seats).split("+")[0]) >= 6:
            return "SUV"
    except (ValueError, TypeError):
        pass
    return None  # genuinely unresolved — caller decides, no silent Sedan default


RENTAL_TYPE_TO_LABEL = {
    "suv": "SUV",
    "truck": "Truck",
    "van": "Van",
    "minivan": "Van",
    "car": None,  # too generic (lumps sedan/hatchback/coupe) — fall through to keywords
}


def build_body_type_lookup(rental_csv_path: str = "data/raw/CarRentalData.csv") -> dict:
    """
    Cross-references the rental dataset's real vehicle.type field to
    build a (make, first-word-of-model) -> body type lookup. This is
    the primary source of truth; keyword guessing is only the fallback
    for cars that don't appear in the rental dataset at all.
    """
    import pandas as pd

    rentals = pd.read_csv(rental_csv_path, encoding="latin1")
    rentals["make_u"] = rentals["vehicle.make"].str.strip().str.upper()
    rentals["model_first"] = rentals["vehicle.model"].str.strip().str.upper().str.split().str[0]

    grouped = rentals.groupby(["make_u", "model_first"])["vehicle.type"].agg(
        lambda x: x.mode()[0]
    )
    lookup = {}
    for (make, model_first), vtype in grouped.items():
        label = RENTAL_TYPE_TO_LABEL.get(vtype)
        if label is not None:
            lookup[(make, model_first)] = label
    return lookup


def guess_body_type(name: str, company: str, seats, lookup: dict) -> str:
    """
    Resolution order:
      1. Real cross-referenced data from the rental dataset (most reliable)
      2. Keyword match on the car name
      3. "Unclassified" — never silently defaults to "Sedan" anymore
    """
    company_u = str(company).strip().upper()
    first_word = str(name).strip().upper().split()[0] if str(name).strip() else ""
    hit = lookup.get((company_u, first_word))
    if hit:
        return hit

    keyword_guess = guess_body_type_from_keywords(name, seats)
    if keyword_guess:
        return keyword_guess

    return "Unclassified"
