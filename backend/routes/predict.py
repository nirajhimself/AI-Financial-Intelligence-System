from fastapi import APIRouter
from services.prediction_service import hybrid_prediction

router = APIRouter()

@router.get("/predict")
def predict(symbol: str):

    result = hybrid_prediction(symbol)

    current = result["current_price"]
    predicted = result["final_prediction"]

    indicator = result.get("indicator_signal")

    # 🔥 PRIORITY: Indicator signal
    if indicator == "BUY":
        recommendation = "BUY"
    elif indicator == "SELL":
        recommendation = "SELL"
    else:
        change = (predicted - current) / current

        if change > 0.02:
            recommendation = "BUY"
        elif change < -0.02:
            recommendation = "SELL"
        else:
            recommendation = "HOLD"

    result["recommendation"] = recommendation

    return result