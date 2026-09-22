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

## Known limitations (be upfront about these with your mentor)

- The recommendation dataset has **no Body Type column** — `body_type` is
  derived with a keyword match on the car name (see
  `recommendation/config.py: guess_body_type`), with a seat-count fallback.
  It's not ground truth and will misclassify some cars (e.g. crossover-styled
  sedans like the Acura RDX get tagged "Sedan" if the name doesn't hint SUV).
- The price model's test R² is ~0.31 — real rental listings are noisy
  (peer-to-peer marketplace pricing varies a lot by owner, not just car
  specs), so this is an honest number, not a bug. Mention this as the
  expected ceiling for this kind of data rather than promising near-perfect
  accuracy.
- `Cars Prices` in the recommendation dataset is retail/purchase price,
  not rental rate — it's used purely as a relative "expensive vs cheap"
  signal for matching, not shown to the customer as a rental price.
