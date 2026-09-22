from price_prediction.model import PricePredictor


def test_model_loads():
    predictor = PricePredictor()
    assert predictor.pipeline is not None


def test_predict_returns_positive_price():
    predictor = PricePredictor()
    price = predictor.predict({"vehicle.make": "Toyota", "vehicle.type": "suv"})
    assert price > 0


def test_predict_handles_missing_fields():
    predictor = PricePredictor()
    price = predictor.predict({})  # should use defaults, not crash
    assert price > 0
