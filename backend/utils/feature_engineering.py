"""
utils/feature_engineering.py
-----------------------------
Clean and consistent feature engineering for stock prediction.
"""

import numpy as np
import pandas as pd
import yfinance as yf


FEATURE_COLS = ["Close", "Volume", "SMA_5", "SMA_10", "SMA_20", "RSI", "Returns"]


# ---------------------------------------------------------------------------
# 1. Data Fetching
# ---------------------------------------------------------------------------

def fetch_stock_data(symbol: str) -> pd.DataFrame:
    df = yf.Ticker(symbol).history(period="2y")

    if df.empty:
        raise ValueError(f"No data found for symbol '{symbol}'")

    df = df[["Open", "High", "Low", "Close", "Volume"]].copy()
    df.index = pd.to_datetime(df.index).tz_localize(None)
    df.sort_index(inplace=True)

    return df


# ---------------------------------------------------------------------------
# 2. Technical Indicators (MASTER FUNCTION)
# ---------------------------------------------------------------------------

def add_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # -------------------------
    # Moving Averages (FIXED)
    # -------------------------
    df["SMA_5"] = df["Close"].rolling(window=5).mean()
    df["SMA_10"] = df["Close"].rolling(window=10).mean()
    df["SMA_20"] = df["Close"].rolling(window=20).mean()  # 🔥 CRITICAL FIX

    # -------------------------
    # Returns
    # -------------------------
    df["Returns"] = df["Close"].pct_change()

    # -------------------------
    # RSI (safe)
    # -------------------------
    delta = df["Close"].diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(14).mean()
    avg_loss = loss.rolling(14).mean()

    rs = avg_gain / (avg_loss + 1e-9)  # 🔥 avoid divide by zero
    df["RSI"] = 100 - (100 / (1 + rs))

    # -------------------------
    # MACD
    # -------------------------
    ema12 = df["Close"].ewm(span=12, adjust=False).mean()
    ema26 = df["Close"].ewm(span=26, adjust=False).mean()

    df["MACD"] = ema12 - ema26
    df["MACD_signal"] = df["MACD"].ewm(span=9, adjust=False).mean()

    # -------------------------
    # DROP NA
    # -------------------------
    df = df.dropna()

    return df


# ---------------------------------------------------------------------------
# 3. Dataset Preparation
# ---------------------------------------------------------------------------

def prepare_dataset(df: pd.DataFrame, sentiment_score: float = 0.0):
    df = df.copy()

    # Add sentiment
    df["Sentiment"] = sentiment_score

    # Target
    df["Target"] = df["Close"].shift(-1)

    df = df.dropna()

    feature_cols = [
        "Close",
        "Volume",
        "SMA_5",
        "SMA_10",
        "SMA_20",
        "RSI",
        "Returns",
        "Sentiment",
    ]

    X = df[feature_cols]
    y = df["Target"]

    return X, y


# ---------------------------------------------------------------------------
# 4. MAIN FEATURE CREATOR (USED EVERYWHERE)
# ---------------------------------------------------------------------------

def create_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # 🔥 ALWAYS USE THIS PIPELINE
    df = add_technical_indicators(df)

    # 🔥 SAFETY CHECK (never fail again)
    required_cols = ["SMA_20", "RSI", "MACD"]

    for col in required_cols:
        if col not in df.columns:
            print(f"⚠️ Auto-fixing missing column: {col}")

            if col == "SMA_20":
                df["SMA_20"] = df["Close"].rolling(20).mean()

            elif col == "RSI":
                delta = df["Close"].diff()
                gain = delta.clip(lower=0)
                loss = -delta.clip(upper=0)
                avg_gain = gain.rolling(14).mean()
                avg_loss = loss.rolling(14).mean()
                rs = avg_gain / (avg_loss + 1e-9)
                df["RSI"] = 100 - (100 / (1 + rs))

            elif col == "MACD":
                ema12 = df["Close"].ewm(span=12).mean()
                ema26 = df["Close"].ewm(span=26).mean()
                df["MACD"] = ema12 - ema26

    df = df.dropna()

    return df