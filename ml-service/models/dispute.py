import joblib
import numpy as np
import os

MODEL_PATH = "saved_models/dispute_model.pkl"

def predict_dispute(features: dict) -> dict:
    if not os.path.exists(MODEL_PATH):
        return _rule_based_dispute(features)

    model = joblib.load(MODEL_PATH)
    X = np.array([[
        features["vendor_disputes_30d"],
        features["vendor_rating"],
        int(features["photo_uploaded"]),
        features["order_value"],
        features["account_age_days"],
        features["time_since_delivery_hours"],
    ]])

    proba = model.predict_proba(X)[0]
    refund_probability = float(proba[1])

    if refund_probability > 0.7:
        recommendation = "refund"
    elif refund_probability < 0.3:
        recommendation = "release"
    else:
        recommendation = "review"

    confidence = max(proba)

    return {
        "score": round(refund_probability, 4),
        "recommendation": recommendation,
        "confidence": round(float(confidence), 4)
    }

def _rule_based_dispute(features: dict) -> dict:
    score = 0.0

    if not features["photo_uploaded"]:
        score += 0.4
    if features["vendor_disputes_30d"] > 3:
        score += 0.2
    if features["vendor_rating"] < 3.0:
        score += 0.2
    if features["time_since_delivery_hours"] < 1:
        score += 0.1
    if features["account_age_days"] > 30:
        score += 0.1

    score = min(score, 1.0)

    if score > 0.7:
        recommendation = "refund"
    elif score < 0.3:
        recommendation = "release"
    else:
        recommendation = "review"

    return {
        "score": round(score, 4),
        "recommendation": recommendation,
        "confidence": 0.6
    }
