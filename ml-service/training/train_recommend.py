"""
Recommendation Engine Training
Uses SVD collaborative filtering (Surprise library)
Run: python training/train_recommend.py
"""
import numpy as np
import pandas as pd
from surprise import SVD, Dataset, Reader
from surprise.model_selection import cross_validate
import joblib
import os
import random

os.makedirs("saved_models", exist_ok=True)

print("Generating synthetic order history data...")

random.seed(42)
np.random.seed(42)

n_students = 200
n_products = 50
n_interactions = 2000

student_ids = [f"student_{i}" for i in range(n_students)]
product_ids = [f"product_{i}" for i in range(n_products)]

data = []
for _ in range(n_interactions):
    student = random.choice(student_ids)
    product = random.choice(product_ids)
    quantity = random.randint(1, 5)
    data.append({"student_id": student, "product_id": product, "quantity": quantity})

df = pd.DataFrame(data)
df = df.groupby(["student_id", "product_id"])["quantity"].sum().reset_index()
df["quantity"] = df["quantity"].clip(1, 10)

reader = Reader(rating_scale=(1, 10))
dataset = Dataset.load_from_df(df[["student_id", "product_id", "quantity"]], reader)

print("Training SVD recommendation model...")
model = SVD(n_factors=50, n_epochs=20, random_state=42)
trainset = dataset.build_full_trainset()
model.fit(trainset)

# Save model and popular products list
popular = df.groupby("product_id")["quantity"].sum().sort_values(ascending=False)
popular_ids = popular.index.tolist()

joblib.dump(model, "saved_models/recommendation_model.pkl")
joblib.dump(popular_ids, "saved_models/popular_products.pkl")
print("Recommendation model saved.")
print("Training complete.")
