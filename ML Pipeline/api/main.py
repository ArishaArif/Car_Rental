"""
PredictDrive — ML Service API
==================================
Single FastAPI app your backend teammate integrates with. Exposes both
AI features behind two endpoints.

Run from inside ml-service/:
    pip install -r requirements.txt
    python -m price_prediction.train        # only needed once, or when data changes
    uvicorn api.main:app --reload

Example calls:
    curl -X POST http://127.0.0.1:8000/recommend \
         -H "Content-Type: application/json" \
         -d '{"body_type": "SUV", "fuel_norm": "Petrol", "seats_n": 5, "price_usd": 40000}'

    curl -X POST http://127.0.0.1:8000/predict-price \
         -H "Content-Type: application/json" \
         -d '{"vehicle_make": "Toyota", "vehicle_type": "suv", "vehicle_year": 2021}'
"""

from fastapi import FastAPI, HTTPException

from recommendation.engine import CarRecommender
from price_prediction.model import PricePredictor
from .schemas import RecommendationRequest, PriceRequest

app = FastAPI(title="PredictDrive ML Service")

# Loaded once at startup, reused across requests
recommender = CarRecommender()

try:
    price_predictor = PricePredictor()
except FileNotFoundError:
    price_predictor = None  # train.py hasn't been run yet


@app.get("/health")
def health():
    return {
        "status": "ok",
        "recommendation_catalog_size": len(recommender.df),
        "price_model_loaded": price_predictor is not None,
    }


@app.post("/recommend")
def recommend(req: RecommendationRequest):
    preferences = req.dict(exclude={"top_n"}, exclude_none=True)
    results = recommender.recommend(preferences, top_n=req.top_n)
    return {"matches": results.to_dict(orient="records")}


@app.post("/predict-price")
def predict_price(req: PriceRequest):
    if price_predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Price model not trained yet — run `python -m price_prediction.train` first.",
        )
    car = {
        "vehicle.make": req.vehicle_make,
        "vehicle.type": req.vehicle_type,
        "vehicle.year": req.vehicle_year,
        "fuelType": req.fuel_type,
        "location.state": req.location_state,
        "rating": req.rating,
        "renterTripsTaken": req.renter_trips_taken,
        "reviewCount": req.review_count,
    }
    car = {k: v for k, v in car.items() if v is not None}
    predicted = price_predictor.predict(car)
    return {"predicted_daily_rate": round(predicted, 2)}
