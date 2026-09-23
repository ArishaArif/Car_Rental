# PredictDrive — ML Service

Two AI features, exposed over one FastAPI app for the backend team to call.

## Setup

```bash
cd ml-service
pip install -r requirements.txt
```

## 1. Train the price prediction model (one-time, or whenever data changes)

```bash
python -m price_prediction.train
```

This reads `data/raw/CarRentalData.csv`, trains a RandomForestRegressor
on real rental fares (`rate.daily`), and saves the fitted pipeline to
`models/price_model.pkl`. The recommendation engine needs no training
step — it runs directly off `data/raw/Cars_Datasets_2025.csv` at
startup.

## 2. Run the API

```bash
uvicorn api.main:app --reload
```

- `GET  /health` — sanity check, catalog size, whether the price model loaded
- `POST /recommend` — vehicle recommendation (content-based filtering)
- `POST /predict-price` — rental price prediction (regression)

See `api/main.py` docstring for example `curl` calls.

## 3. Run tests

```bash
python -m pytest tests/ -q
```

## Datasets

| Feature | File | Source |
|---|---|---|
| Recommendation | `data/raw/Cars_Datasets_2025.csv` | Kaggle — Cars Datasets (2025) |
| Price prediction | `data/raw/CarRentalData.csv` | Kaggle — Cornell Car Rental Dataset |

`CarRentalDataV1.csv` (same data + an `airportcity` column) is kept in
`data/raw/` but not currently used — swap it in if you want that field later.

## Known limitations 

- **Body type is resolved in two stages**: first by cross-referencing
  make+model against the real `vehicle.type` field in `CarRentalData.csv`
  (400 known make+model combos), then by keyword-matching the car name
  for anything not found there. Cars matching neither are labeled
  `"Unclassified"` rather than guessed — roughly **62% of the 1,217-car
  catalog** falls here, almost entirely exotic/collector brands (Ferrari,
  Lamborghini, Bentley, Rolls Royce, Aston Martin) that aren't realistic
  rental-fleet inventory anyway. Worth stating this plainly if asked,
  rather than presenting the catalog as fully classified.
- The API rejects unrecognized field names (`extra="forbid"` on both
  request schemas) — a typo like `"year"` instead of `"vehicle_year"`
  now returns a `422` error instead of silently falling back to
  defaults and returning a plausible-looking but meaningless number.
- The price model's test R² is ~0.31 — real rental listings are noisy
  (peer-to-peer marketplace pricing varies a lot by owner, not just car
  specs), so this is an honest number, not a bug. Mention this as the
  expected ceiling for this kind of data rather than promising near-perfect
  accuracy.
- `Cars Prices` in the recommendation dataset is retail/purchase price,
  not rental rate — it's used purely as a relative "expensive vs cheap"
  signal for matching, not shown to the customer as a rental price.