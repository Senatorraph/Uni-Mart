"""
Fraud Detection Model Training
Uses Isolation Forest on synthetic transaction data
Run: python training/train_fraud.py
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import os
import random

os.makedirs("saved_models", exist_ok=True)

print("Generating synthetic transaction data...")

random.seed(42)
np.random.seed(42)

n_normal = 4500
n_fraud = 500

# Normal transactions
normal = pd.DataFrame({
    "order_value": np.random.uniform(500, 30000, n_normal),
    "time_of_day": np.random.randint(7, 23, n_normal),
    "orders_last_hour": np.random.randint(0, 3, n_normal),
    "account_age_days": np.random.randint(30, 1000, n_normal),
    "cart_item_count": np.random.randint(1, 8, n_normal),
})

# Fraudulent transactions
fraud = pd.DataFrame({
    "order_value": np.random.uniform(80000, 500000, n_fraud),
    "time_of_day": np.random.randint(0, 5, n_fraud),
    "orders_last_hour": np.random.randint(8, 30, n_fraud),
    "account_age_days": np.random.randint(0, 3, n_fraud),
    "cart_item_count": np.random.randint(15, 50, n_fraud),
})

df = pd.concat([normal, fraud], ignore_index=True)
X = df[["order_value", "time_of_day", "orders_last_hour", "account_age_days", "cart_item_count"]]

print("Training Isolation Forest model...")
model = IsolationForest(
    n_estimators=100,
    contamination=0.1,
    random_state=42
)
model.fit(X)

joblib.dump(model, "saved_models/fraud_model.pkl")
print("Fraud model saved to saved_models/fraud_model.pkl")
print("Training complete.")
