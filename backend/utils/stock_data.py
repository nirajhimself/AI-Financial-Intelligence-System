import yfinance as yf

def get_stock_data(symbol):

    df = yf.download(symbol, period="5y", group_by="column")

    # 🔥 FIX: flatten columns if multi-index
    if isinstance(df.columns, tuple) or hasattr(df.columns, "levels"):
        df.columns = df.columns.get_level_values(0)

    df = df.reset_index()

    return df