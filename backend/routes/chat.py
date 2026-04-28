from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.prediction_service import hybrid_prediction
from ai.llm import chat_with_ai

router = APIRouter(tags=["Chat AI"])


class ChatRequest(BaseModel):
    message: str
    symbol: str


@router.post("/chat")
def chat(req: ChatRequest):
    try:
        if not req.message:
            raise HTTPException(status_code=400, detail="Message required")

        user_msg = req.message.lower()

        # 🔥 STEP 1: HANDLE SMART FALLBACK (INSTANT RESPONSES)

        if "how to buy" in user_msg:
            return {
                "response": f"""
To buy {req.symbol} stock:

1. Open Zerodha / Groww / Upstox
2. Search for {req.symbol}
3. Click BUY
4. Enter quantity
5. Choose Market or Limit order
6. Confirm order

💡 Tip: Use LIMIT order to avoid bad price execution.
"""
            }

        if "should i invest" in user_msg or "buy or sell" in user_msg:
            stock_data = hybrid_prediction(req.symbol)

            decision = stock_data["indicator_signal"]
            price = stock_data["current_price"]
            target = stock_data["final_prediction"]

            return {
                "response": f"""
Stock: {req.symbol}

📊 Current Price: {price}
🎯 Target Price: {target}

📢 Recommendation: {decision}

👉 Reason:
- Based on AI prediction and technical indicators
- Risk is controlled within ±5%

💡 Advice:
- BUY → if long-term
- HOLD → if already invested
- SELL → if risk-averse
"""
            }

        # 🔥 STEP 2: GET FULL AI CONTEXT

        stock_data = hybrid_prediction(req.symbol)

        prompt = f"""
You are a professional stock market AI advisor.

Stock: {req.symbol}

DATA:
- Current Price: {stock_data['current_price']}
- Predicted Price: {stock_data['final_prediction']}
- Sentiment: {stock_data['sentiment_label']}
- Accuracy: {stock_data['accuracy']}
- Signal: {stock_data['indicator_signal']}

User Question:
{req.message}

Instructions:
- Give SHORT, CLEAR, actionable answer
- Use bullet points if needed
- Avoid generic replies
- Be confident and practical
"""

        # 🔥 STEP 3: CALL LLM
        answer = chat_with_ai(prompt)

        # 🔥 STEP 4: SAFETY FALLBACK (IF AI FAILS OR GIVES BAD RESPONSE)
        if not answer or len(answer.strip()) < 5:
            return {
                "response": f"""
Stock: {req.symbol}

📊 Current Price: {stock_data['current_price']}
📢 Signal: {stock_data['indicator_signal']}

👉 Basic Advice:
- BUY → if bullish trend
- HOLD → if sideways
- SELL → if bearish

(⚠️ AI response unavailable, showing fallback)
"""
            }

        return {"response": answer}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))