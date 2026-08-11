"""
Demand Forecasting Model Training
Uses Facebook Prophet for time-series prediction
Run: python training/train_forecast.py
"""
import pandas as pd
import numpy as np
from prophet import Prophet
import joblib
import os
import random
from datetime import datetime, timedelta

os.makedirs("saved_models", exist_ok=True)

print("Generating synthetic demand data...")

random.seed(42)
np.random.seed(42)

vendor_ids = [
    "a1000000-0000-0000-0000-000000000001",
    "a1000000-0000-0000-0000-000000000002",
]

for vendor_id in vendor_ids:
    print(f"Training forecast model for vendor {vendor_id[:8]}...")

    dates = [datetime.now() - timedelta(days=i) for i in range(180, 0, -1)]
    base_demand = random.randint(10, 30)

    orders = []
    for date in dates:
        day_of_week = date.weekday()
        # Higher demand on weekdays
        weekday_boost = 1.3 if day_of_week < 5 else 0.7
        # End of month boost (students get allowance)
        month_boost = 1.5 if date.day >= 25 else 1.0
        noise = random.uniform(0.7, 1.3)
        order_count = max(0, round(base_demand * weekday_boost * month_boost * noise))
        orders.append({"ds": date.strftime("%Y-%m-%d"), "y": order_count})

    df = pd.DataFrame(orders)
    df["ds"] = pd.to_datetime(df["ds"])

    model = Prophet(
        weekly_seasonality=True,
        yearly_seasonality=False,
        daily_seasonality=False,
        seasonality_mode="multiplicative"
    )
    model.fit(df)

    model_path = f"saved_models/forecast_{vendor_id}.pkl"
    joblib.dump(model, model_path)
    print(f"Forecast model saved for vendor {vendor_id[:8]}")

print("\nAll forecast models trained successfully.")
