from typing import Optional
from pydantic import BaseModel, ConfigDict


class RecommendationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")  # unknown fields -> 422, not silently ignored

    body_type: Optional[str] = None      # "SUV" | "Sedan" | "Hatchback" | "Truck" | "Van"
    fuel_norm: Optional[str] = None       # "Petrol" | "Diesel" | "Hybrid" | "Electric" | "Hydrogen"
    seats_n: Optional[float] = None
    price_usd: Optional[float] = None
    top_n: int = 5


class PriceRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    vehicle_make: Optional[str] = None
    vehicle_type: Optional[str] = None    # "suv" | "car" | "truck" | "minivan" | "van"
    vehicle_year: Optional[int] = None
    fuel_type: Optional[str] = None       # "GASOLINE" | "ELECTRIC" | "HYBRID" | "DIESEL"
    location_state: Optional[str] = None
    rating: Optional[float] = None
    renter_trips_taken: Optional[int] = None
    review_count: Optional[int] = None
