from fastapi import APIRouter, HTTPException, Query
from services.recommendation_service import recommend_stocks

router = APIRouter(tags=["AI Recommendations"])


# ================================
# ✅ AI STOCK RECOMMENDATIONS
# ================================
@router.get("/recommendations")
def ai_stock_recommendations(
    amount: float = Query(..., gt=0, description="Investment amount"),
    duration: str = Query(..., description="Investment duration (e.g. '3 months', '1 year')"),
    market: str = Query("india", description="Market (india, us, etc.)")
):
    try:
        data = recommend_stocks(amount, duration, market)

        # 🔥 Handle empty or failed results
        if not data or ("error" in data):
            return {
                "feature": "AI Stock Recommendations",
                "amount": amount,
                "duration": duration,
                "market": market,
                "result": {
                    "error": data.get("error", "No recommendations available")
                }
            }

        return {
            "feature": "AI Stock Recommendations",
            "amount": amount,
            "duration": duration,
            "market": market,
            "result": data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
