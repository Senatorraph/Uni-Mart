from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import os

app = FastAPI(
    title="UniMarket ML Service",
    description="AI/ML microservice for UniMarket campus marketplace",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FraudScoreRequest(BaseModel):
    order_value: float
    time_of_day: int
    orders_last_hour: int
    account_age_days: int
    cart_item_count: int
    university_id: str

class FraudScoreResponse(BaseModel):
    score: float
    flag: bool
    action: str

class RecommendResponse(BaseModel):
    student_id: str
    recommendations: List[str]
    source: str

class DisputeScoreRequest(BaseModel):
    vendor_disputes_30d: int
    vendor_rating: float
    photo_uploaded: bool
    order_value: float
    account_age_days: int
    time_since_delivery_hours: float

class DisputeScoreResponse(BaseModel):
    score: float
    recommendation: str
    confidence: float

class ForecastResponse(BaseModel):
    vendor_id: str
    forecast: List[dict]

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "UniMarket ML Service",
        "version": "1.0.0",
        "models": {
            "fraud": os.path.exists("saved_models/fraud_model.pkl"),
            "recommendation": os.path.exists("saved_models/recommendation_model.pkl"),
            "dispute": os.path.exists("saved_models/dispute_model.pkl"),
            "forecast": os.path.exists("saved_models/forecast_model.pkl"),
        }
    }

@app.post("/fraud/score", response_model=FraudScoreResponse)
def fraud_score(request: FraudScoreRequest):
    try:
        from models.fraud import predict_fraud
        result = predict_fraud(request.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recommend/{student_id}", response_model=RecommendResponse)
def recommend(student_id: str, university_id: str, limit: int = 10):
    try:
        from models.recommend import get_recommendations
        result = get_recommendations(student_id, university_id, limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/dispute/score", response_model=DisputeScoreResponse)
def dispute_score(request: DisputeScoreRequest):
    try:
        from models.dispute import predict_dispute
        result = predict_dispute(request.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/forecast/{vendor_id}", response_model=ForecastResponse)
def forecast(vendor_id: str, days: int = 7):
    try:
        from models.forecast import get_forecast
        result = get_forecast(vendor_id, days)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
