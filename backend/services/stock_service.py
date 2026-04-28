import yfinance as yf

def get_current_price(symbol):
    ticker = yf.Ticker(symbol)
    data = ticker.history(period="1d")
    return float(data["Close"].iloc[-1])

def get_history(symbol, period="5y"):
    ticker = yf.Ticker(symbol)
    return ticker.history(period=period)