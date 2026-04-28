import yfinance as yf
import pandas as pd
import numpy as np

STOCK_LIST = [
    "RELIANCE.NS",
    "TCS.NS",
    "HDFCBANK.NS",
    "INFY.NS",
    "ICICIBANK.NS",
    "ITC.NS",
]


# -------------------------
# ADD FEATURES
# -------------------------
def add_indicators(df):

    delta = df["Close"].diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = -delta.clip(upper=0).rolling(14).mean()
    rs = gain / loss
    df["RSI"] = 100 - (100 / (1 + rs))

    exp1 = df["Close"].ewm(span=12).mean()
    exp2 = df["Close"].ewm(span=26).mean()
    df["MACD"] = exp1 - exp2

    df["Return"] = df["Close"].pct_change()
    df["Volatility"] = df["Return"].rolling(10).std()

    # ✅ FIXED LINES
    df["SMA_20"] = df["Close"].rolling(20, min_periods=1).mean()
    df["SMA_50"] = df["Close"].rolling(50, min_periods=1).mean()

    df["Momentum"] = df["Close"] - df["Close"].shift(5)
    df["Volume_Change"] = df["Volume"].pct_change()

    return df


# -------------------------
# BUILD DATASET
# -------------------------
def build_dataset():
    data = []

    for stock in STOCK_LIST:
        print(f"Processing {stock}...")

        df = yf.Ticker(stock).history(period="2y")

        if df.empty:
            continue

        df = add_indicators(df)

        # Target: future 5-day return
        df["Target"] = df["Close"].shift(-5) / df["Close"] - 1

        # 🔥 CLEAN DATA (FIXED INDENTATION)
        df.replace([np.inf, -np.inf], np.nan, inplace=True)
        df = df.fillna(0)
        df = df.clip(-10, 10)

        # Build rows
        for _, row in df.iterrows():
            data.append(
                [
                    row["RSI"],
                    row["MACD"],
                    row["Return"],
                    row["Volatility"],
                    row["SMA_20"],
                    row["SMA_50"],
                    row["Momentum"],
                    row["Volume_Change"],
                    row["Target"],
                ]
            )

    # Create dataframe
    dataset = pd.DataFrame(
        data,
        columns=[
            "RSI",
            "MACD",
            "Return",
            "Volatility",
            "SMA_20",
            "SMA_50",
            "Momentum",
            "Volume_Change",
            "Target",
        ],
    )

    dataset.to_csv("stock_dataset.csv", index=False)

    print("✅ Dataset created successfully!")
    print("Shape:", dataset.shape)


# -------------------------
# RUN
# -------------------------
if __name__ == "__main__":
    build_dataset()
