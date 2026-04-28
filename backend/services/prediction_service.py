import numpy as np
import pandas as pd
import yfinance as yf

from utils.stock_data import get_stock_data
from utils.feature_engineering import create_features
from utils.sentiment import get_sentiment_score
from ml.models import train_models


# -------------------------------
# RULE BASED
# -------------------------------
def rule_based_prediction(df):
    current_price = float(df["Close"].iloc[-1])

    if df.shape[0] < 20:
        return current_price

    ma10 = df["Close"].rolling(10).mean().iloc[-1]
    ma20 = df["Close"].rolling(20).mean().iloc[-1]

    if pd.isna(ma10) or pd.isna(ma20):
        return current_price

    trend = 1 if ma10 > ma20 else -1

    return float(current_price * (1 + 0.01 * trend))


# -------------------------------
# INDICATOR SIGNAL
# -------------------------------
def indicator_signal(df):

    if df.shape[0] < 30:
        return "HOLD"

    latest = df.iloc[-1]
    signals = []

    if latest["RSI"] < 30:
        signals.append("BUY")
    elif latest["RSI"] > 70:
        signals.append("SELL")

    if latest["MACD"] > latest["MACD_signal"]:
        signals.append("BUY")
    else:
        signals.append("SELL")

    if signals.count("BUY") > signals.count("SELL"):
        return "BUY"
    elif signals.count("SELL") > signals.count("BUY"):
        return "SELL"
    else:
        return "HOLD"


# -------------------------------
# MAIN HYBRID FUNCTION (FIXED)
# -------------------------------
def hybrid_prediction(symbol):

    print(f"\n🔍 Processing: {symbol}")

    # -------------------------------
    # STEP 1: Fetch data
    # -------------------------------
    df = get_stock_data(symbol)
    df = df[["Date", "Open", "High", "Low", "Close", "Volume"]]

    # -------------------------------
    # STEP 2: LIVE CURRENT PRICE
    # -------------------------------
    try:
        ticker = yf.Ticker(symbol)
        current_price = ticker.fast_info.get("last_price", None)

        if current_price is None:
            hist = ticker.history(period="1d")
            if not hist.empty:
                current_price = float(hist["Close"].iloc[-1])
    except Exception as e:
        print("⚠️ Live price fetch failed:", e)
        current_price = None

    # fallback
    if current_price is None:
        current_price = float(df["Close"].iloc[-1])

    current_price = float(current_price)

    # -------------------------------
    # STEP 3: Feature engineering
    # -------------------------------
    df = create_features(df)
    df = df.dropna()

    # -------------------------------
    # STEP 4: Indicator signal
    # -------------------------------
    indicator = indicator_signal(df)

    # -------------------------------
    # STEP 5: ML model
    # -------------------------------
    best_model, model_name, prediction, accuracy = train_models(df)

    # -------------------------------
    # STEP 6: Rule-based prediction
    # -------------------------------
    rule_pred = rule_based_prediction(df)

    # -------------------------------
    # STEP 7: Sentiment
    # -------------------------------
    sentiment_score = get_sentiment_score(symbol)

    # -------------------------------
    # STEP 8: Safe conversions
    # -------------------------------
    prediction = float(prediction)
    accuracy = float(accuracy)
    rule_pred = float(rule_pred)
    sentiment_score = float(sentiment_score)

    # -------------------------------
    # STEP 9: SENTIMENT IMPACT (CONTROLLED)
    # -------------------------------
    sentiment_factor = (sentiment_score - 50) / 200  # small impact

    # -------------------------------
    # STEP 10: BASE PREDICTION (HYBRID)
    # -------------------------------
    base_prediction = (
        0.5 * prediction +
        0.3 * rule_pred +
        0.2 * current_price
    )

    # apply sentiment
    base_prediction *= (1 + sentiment_factor)

    # -------------------------------
    # STEP 11: LIMIT EXTREME MOVEMENT
    # -------------------------------
    max_change = 0.05  # ±5%

    change = (base_prediction - current_price) / current_price
    change = max(min(change, max_change), -max_change)

    final_prediction = current_price * (1 + change)

    # -------------------------------
    # STEP 12: SENTIMENT LABEL (CONSISTENT)
    # -------------------------------
    if sentiment_score > 60:
        sentiment_label = "Positive"
    elif sentiment_score < 40:
        sentiment_label = "Negative"
    else:
        sentiment_label = "Neutral"

    # -------------------------------
    # STEP 13: FINAL RESPONSE
    # -------------------------------
    result = {
        "current_price": round(current_price, 2),
        "ml_prediction": round(prediction, 2),
        "rule_prediction": round(rule_pred, 2),
        "final_prediction": round(final_prediction, 2),
        "best_model": str(model_name),
        "sentiment_score": round(sentiment_score, 2),
        "sentiment_label": sentiment_label,
        "indicator_signal": str(indicator),
        "accuracy": round(accuracy, 2),

        # 🔥 CRITICAL FIX: frontend sync
        "recommendation": str(indicator)
    }

    print("✅ FINAL OUTPUT:", result)

    return result