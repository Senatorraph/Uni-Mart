import joblib
import os
import random

MODEL_PATH = "saved_models/recommendation_model.pkl"
POPULAR_PATH = "saved_models/popular_products.pkl"

def get_recommendations(student_id: str, university_id: str, limit: int = 10) -> dict:
    if not os.path.exists(MODEL_PATH):
        return _popular_fallback(student_id, university_id, limit)

    try:
        model = joblib.load(MODEL_PATH)
        popular = joblib.load(POPULAR_PATH) if os.path.exists(POPULAR_PATH) else []

        predictions = []
        for product_id in popular:
            pred = model.predict(student_id, product_id)
            predictions.append((product_id, pred.est))

        predictions.sort(key=lambda x: x[1], reverse=True)
        top = [p[0] for p in predictions[:limit]]

        return {
            "student_id": student_id,
            "recommendations": top,
            "source": "model"
        }
    except Exception:
        return _popular_fallback(student_id, university_id, limit)

def _popular_fallback(student_id: str, university_id: str, limit: int) -> dict:
    if os.path.exists(POPULAR_PATH):
        popular = joblib.load(POPULAR_PATH)
        return {
            "student_id": student_id,
            "recommendations": popular[:limit],
            "source": "popular"
        }

    return {
        "student_id": student_id,
        "recommendations": [],
        "source": "fallback"
    }
