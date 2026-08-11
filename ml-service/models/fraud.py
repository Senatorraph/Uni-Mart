import joblib
import numpy as np
import os

MODEL_PATH = "saved_models/fraud_model.pkl"

def predict_fraud(features: dict) -> dict:
    if not os.path.exists(MODEL_PATH):
        return _rule_based_fraud(features)

    model = joblib.load(MODEL_PATH)
    X = np.array([[
        features["order_value"],
        features["time_of_day"],
        features["orders_last_hour"],
        features["account_age_days"],
        features["cart_item_count"],
    ]])

    # decision_function: negative = anomaly, positive = normal
    # Convert to 0-1 risk score where 1 = highest risk
    raw_score = float(model.decision_function(X)[0])

    # Normalize: typical range is roughly -0.5 to 0.5
    # Map so that -0.5 -> 1.0 (high risk) and 0.5 -> 0.0 (low risk)
    normalized = max(0.0, min(1.0, (-raw_score + 0.5)))

    if normalized > 0.75:
        action = "block"
        flag = True
    elif normalized > 0.4:
        action = "review"
        flag = True
    else:
        action = "approve"
        flag = False

    return {
        "score": round(normalized, 4),
        "flag": flag,
        "action": action
    }

def _rule_based_fraud(features: dict) -> dict:
    score = 0.0

    if features["order_value"] > 100000:
        score += 0.3
    if features["orders_last_hour"] > 5:
        score += 0.3
    if features["account_age_days"] < 1:
        score += 0.2
    if features["time_of_day"] < 5:
        score += 0.1
    if features["cart_item_count"] > 20:
        score += 0.1

    score = min(score, 1.0)
    flag = score > 0.4
    action = "block" if score > 0.75 else "review" if score > 0.4 else "approve"

    return {"score": round(score, 4), "flag": flag, "action": action}
