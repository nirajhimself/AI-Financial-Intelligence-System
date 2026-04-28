import numpy as np

def calculate_risk(df):
    returns = df["Close"].pct_change().dropna()
    volatility = np.std(returns) * 100
    return min(round(volatility * 2, 2), 100)