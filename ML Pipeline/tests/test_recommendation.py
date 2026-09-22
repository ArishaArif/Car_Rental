from recommendation.engine import CarRecommender


def test_catalog_loads():
    engine = CarRecommender()
    assert len(engine.df) > 0


def test_recommend_returns_top_n():
    engine = CarRecommender()
    results = engine.recommend({"body_type": "SUV"}, top_n=3)
    assert len(results) == 3


def test_recommend_respects_body_type_when_possible():
    engine = CarRecommender()
    results = engine.recommend({"body_type": "Truck"}, top_n=5)
    assert (results["body_type"] == "Truck").any()
