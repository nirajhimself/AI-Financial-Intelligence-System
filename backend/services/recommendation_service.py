import yfinance as yf
import pandas as pd
import numpy as np
import joblib
import random

from textblob import TextBlob
from newsapi import NewsApiClient
from sklearn.preprocessing import MinMaxScaler


# -------------------------
# LOAD MODEL
# -------------------------
try:
    ml_model = joblib.load("model.pkl")
except:
    ml_model = None

scaler = MinMaxScaler()

NEWS_API_KEY = "b94392e2f33d4b0f8e5cd573afdba66f"
newsapi = NewsApiClient(api_key=NEWS_API_KEY)


# -------------------------
# INDICATORS
# -------------------------
def add_indicators(df):
    df = df.copy()

    df["Return"] = df["Close"].pct_change()
    df["Volatility"] = df["Return"].rolling(10).std()

    df["SMA_20"] = df["Close"].rolling(20).mean()
    df["SMA_50"] = df["Close"].rolling(50).mean()

    df["Momentum"] = df["Close"] - df["Close"].shift(10)
    df["Volume_Change"] = df["Volume"].pct_change()

    delta = df["Close"].diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = -delta.clip(upper=0).rolling(14).mean()
    rs = gain / (loss + 1e-9)
    df["RSI"] = 100 - (100 / (1 + rs))

    exp1 = df["Close"].ewm(span=12).mean()
    exp2 = df["Close"].ewm(span=26).mean()
    df["MACD"] = exp1 - exp2

    return df.replace([np.inf, -np.inf], np.nan).dropna()


# -------------------------
# ML PREDICTION
# -------------------------
def predict_ml_return(df):
    try:
        if ml_model is None:
            return None

        df = add_indicators(df)

        if df.empty or len(df) < 60:
            return None

        latest = df.iloc[-1]

        features = pd.DataFrame([{
            "RSI": latest["RSI"],
            "MACD": latest["MACD"],
            "Return": latest["Return"],
            "Volatility": latest["Volatility"],
            "SMA_20": latest["SMA_20"],
            "SMA_50": latest["SMA_50"],
            "Momentum": latest["Momentum"],
            "Volume_Change": latest["Volume_Change"],
        }])

        features = features.fillna(0)
        features_scaled = scaler.fit_transform(features)

        return float(ml_model.predict(features_scaled)[0])

    except:
        return None


# -------------------------
# SENTIMENT
# -------------------------
def get_sentiment(symbol):
    try:
        articles = newsapi.get_everything(q=symbol, language="en", page_size=5)

        scores = []
        for a in articles["articles"]:
            text = (a["title"] or "") + " " + (a["description"] or "")
            scores.append(TextBlob(text).sentiment.polarity)

        return sum(scores) / len(scores) if scores else 0

    except:
        return 0


# -------------------------
# RETURN ESTIMATION
# -------------------------
def estimate_return(df):
    returns = df["Close"].pct_change().dropna()

    if len(returns) < 30:
        return 0.05

    recent = returns[-20:].mean()
    long_term = returns.mean()

    momentum = recent * 252
    baseline = long_term * 252

    return float(0.7 * momentum + 0.3 * baseline)


# -------------------------
# SCORE
# -------------------------
def calculate_score(df, sentiment, expected_return):
    if df.empty:
        return -999

    df = add_indicators(df)
    latest = df.iloc[-1]

    score = 0

    if latest["SMA_20"] > latest["SMA_50"]:
        score += 3
    else:
        score -= 3

    if 30 < latest["RSI"] < 60:
        score += 2
    elif latest["RSI"] > 75:
        score -= 2

    if latest["MACD"] > 0:
        score += 2
    else:
        score -= 1

    if latest["Momentum"] > 0:
        score += 2

    # 🔥 boost return strongly
    score += expected_return * 10

    # 🔥 sentiment weight
    score += sentiment * 2

    # 🔥 penalty for weak stocks
    if expected_return < 0.02:
        score -= 3

    return score


# -------------------------
# MAIN ENGINE (FINAL FIX)
# -------------------------
def recommend_stocks(amount, duration, market="india"):

    stock_list = [
        "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS",
        "ICICIBANK.NS", "SBIN.NS", "LT.NS", "AXISBANK.NS",
        "BAJFINANCE.NS", "KOTAKBANK.NS", "ITC.NS",
        "ADANIENT.NS", "TATASTEEL.NS", "MARUTI.NS"
    ]

    random.shuffle(stock_list)

    results = []

    for stock in stock_list:
        try:
            df = yf.Ticker(stock).history(period="6mo")

            if df.empty or len(df) < 50:
                continue

            ml_return = predict_ml_return(df)
            expected_return = ml_return if ml_return else estimate_return(df)

            sentiment = get_sentiment(stock)

            score = calculate_score(df, sentiment, expected_return)

            results.append((stock, score, expected_return))

        except:
            continue

    # 🔥 FALLBACK (VERY IMPORTANT)
    if not results:
        return {
            "stocks": [],
            "portfolio_future_value": 0,
            "portfolio_return_percent": 0
        }

    # 🔥 SORT
    results.sort(key=lambda x: x[1], reverse=True)
    top = results[:5]

    # 🔥 SOFTMAX (FIXED)
    scores = np.array([max(s[1], 0.01) for s in top])
    exp_scores = np.exp(scores)
    weights = exp_scores / exp_scores.sum()

    output = []
    total_future_value = 0

    for i, (stock, score, expected_return) in enumerate(top):
        weight = weights[i]
        investment = amount * weight

        future_value = investment * (1 + expected_return)
        total_future_value += future_value

        confidence = min(95, max(50, (score * 10 + 50)))

        output.append({
            "symbol": stock,
            "investment": round(investment, 2),
            "expected_return_percent": round(expected_return * 100, 2),
            "future_value": round(future_value, 2),
            "confidence": round(confidence, 2),
        })

    return {
        "stocks": output,
        "portfolio_future_value": round(total_future_value, 2),
        "portfolio_return_percent": round(
            ((total_future_value - amount) / amount) * 100, 2
        ),
    }