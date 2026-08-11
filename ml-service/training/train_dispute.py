"""
Dispute Classifier Training
Uses Random Forest on synthetic dispute data
Run: python training/train_dispute.py
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

os.makedirs("saved_models", exist_ok=True)

print("Generating synthetic dispute data...")

np.random.seed(42)
n = 2000

df = pd.DataFrame({
    "vendor_disputes_30d": np.random.randint(0, 10, n),
    "vendor_rating": np.random.uniform(1.0, 5.0, n),
    "photo_uploaded": np.random.randint(0, 2, n),
    "order_value": np.random.uniform(500, 50000, n),
    "account_age_days": np.random.randint(1, 1000, n),
    "time_since_delivery_hours": np.random.uniform(0, 24, n),
})

# Label: 1 = refund, 0 = release
# Logic: refund likely if no photo, bad vendor, many disputes
df["label"] = (
    (df["photo_uploaded"] == 0).astype(int) * 0.4 +
    (df["vendor_disputes_30d"] > 3).astype(int) * 0.3 +
    (df["vendor_rating"] < 3.0).astype(int) * 0.2 +
    np.random.uniform(0, 0.1, n)
).apply(lambda x: 1 if x > 0.4 else 0)

X = df[["vendor_disputes_30d", "vendor_rating", "photo_uploaded",
        "order_value", "account_age_days", "time_since_delivery_hours"]]
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training Random Forest classifier...")
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    class_weight="balanced"
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("\nModel Performance:")
print(classification_report(y_test, y_pred, target_names=["Release", "Refund"]))

joblib.dump(model, "saved_models/dispute_model.pkl")
print("Dispute model saved to saved_models/dispute_model.pkl")
