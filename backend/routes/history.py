from fastapi import APIRouter, HTTPException
import yfinance as yf

router = APIRouter(tags=["History"])


@router.get("/history")
def get_history(symbol: str):
    try:
        ticker = yf.Ticker(symbol)

        # 🔥 get 1 year data
        df = ticker.history(period="1y")

        if df.empty:
            raise HTTPException(status_code=404, detail="No data found")

        # 🔥 return FULL OHLC data (IMPORTANT FOR CHART)
        result = [
            {
                "date": str(index.date()),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": int(row["Volume"]),
            }
            for index, row in df.iterrows()
        ]

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))