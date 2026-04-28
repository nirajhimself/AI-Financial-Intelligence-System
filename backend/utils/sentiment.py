import random

def get_sentiment_score(symbol):

    # 🔥 Simulated sentiment (can be replaced with news API later)

    positive_keywords = ["growth", "profit", "bullish", "upgrade"]
    negative_keywords = ["loss", "decline", "bearish", "downgrade"]

    # simulate sentiment score
    score = random.uniform(-1, 1)

    # scale to percentage
    sentiment_score = round(score * 100, 2)

    return sentiment_score