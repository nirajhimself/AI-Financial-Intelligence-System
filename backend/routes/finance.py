from fastapi import APIRouter, HTTPException
import yfinance as yf

router = APIRouter(tags=["Market Data"])


# ================================
# ✅ SINGLE STOCK PRICE
# ================================
@router.get("/price")
def get_price(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="2d")

        if data.empty:
            raise HTTPException(status_code=404, detail="Invalid symbol or no data found")

        if len(data) >= 2:
            prev = float(data["Close"].iloc[-2])
            curr = float(data["Close"].iloc[-1])
            change = curr - prev
            change_pct = (change / prev) * 100 if prev != 0 else 0
        else:
            curr = float(data["Close"].iloc[-1])
            change = 0
            change_pct = 0

        return {
            "symbol": symbol.upper(),
            "price": round(curr, 2),
            "change": round(change, 2),
            "change_pct": round(change_pct, 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================================
# ✅ MULTIPLE STOCK PRICES
# ================================
@router.get("/prices")
def get_prices(symbols: str):
    try:
        symbol_list = [s.strip() for s in symbols.split(",") if s.strip()]

        result = []

        for symbol in symbol_list:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period="1d")

            if not data.empty:
                price = round(float(data["Close"].iloc[-1]), 2)
            else:
                price = None

            result.append({
                "symbol": symbol.upper(),
                "price": price
            })

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================================
# ✅ STOCK HISTORY (1 YEAR)
# ================================
@router.get("/history")
def get_history(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period="1y")

        if df.empty:
            raise HTTPException(status_code=404, detail="No historical data found")

        return [
            {
                "date": str(index.date()),
                "close": round(float(row["Close"]), 2)
            }
            for index, row in df.iterrows()
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
