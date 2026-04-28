import numpy as np

# --------------------------------------------------
# SAFE FEATURE ACCESS (NO CRASHES)
# --------------------------------------------------

def safe_get(df, col, default=0):
    if col not in df.columns:
        return default
    return df[col].iloc[-1]


# --------------------------------------------------
# STOCK SCORING FUNCTION
# --------------------------------------------------

def score_stock(df, sentiment_score):
    try:
        latest_close = safe_get(df, "Close")
        sma10 = safe_get(df, "SMA_10", latest_close)
        sma20 = safe_get(df, "SMA_20", latest_close)
        rsi = safe_get(df, "RSI", 50)
        macd = safe_get(df, "MACD", 0)
        macd_signal = safe_get(df, "MACD_signal", 0)

        score = 0

        # -------------------------
        # TREND (VERY IMPORTANT)
        # -------------------------
        if sma10 > sma20:
            score += 2
        else:
            score -= 2

        # -------------------------
        # RSI
        # -------------------------
        if rsi < 35:
            score += 2
        elif rsi > 70:
            score -= 2

        # -------------------------
        # MACD
        # -------------------------
        if macd > macd_signal:
            score += 1
        else:
            score -= 1

        # -------------------------
        # SENTIMENT (controlled)
        # -------------------------
        score += (sentiment_score - 50) / 20

        return float(score)

    except Exception as e:
        print("⚠️ scoring failed:", e)
        return -999  # worst score