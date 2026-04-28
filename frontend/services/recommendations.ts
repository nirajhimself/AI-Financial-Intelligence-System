import axios from 'axios';
import type {
  RecommendationInput, RecommendationResponse,
  StockRecommendation, Duration, Market,
} from '@/types/recommendations';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Mock fallback ─────────────────────────────────────────────────────────────
const INDIA_STOCKS = ['RELIANCE.NS','TCS.NS','INFY.NS','HDFCBANK.NS','ICICIBANK.NS','WIPRO.NS','RVNL.NS','ADANIENT.NS','SBIN.NS','BAJFINANCE.NS'];
const US_STOCKS    = ['AAPL','MSFT','NVDA','GOOG','AMZN','META','TSLA','JPM','AMD','NFLX'];

function generateMock(input: RecommendationInput): RecommendationResponse {
  const pool  = input.market === 'india' ? INDIA_STOCKS : US_STOCKS;
  const multi: Record<Duration, number> = { '1month': 0.9, '6months': 1.2, '1year': 1.5, '3years': 2.2 };
  const m     = multi[input.duration];
  const picked= pool.slice(0, 5 + Math.floor(Math.random() * 4));
  const weights = picked.map(() => Math.random() * 0.5 + 0.5);
  const totalW  = weights.reduce((a, b) => a + b, 0);

  const stocks: StockRecommendation[] = picked.map((symbol, i) => {
    const investment              = Math.round((weights[i] / totalW) * input.amount);
    const expected_return_percent = +(Math.random() * 22 * m - 3).toFixed(2);
    const future_value            = +(investment * (1 + expected_return_percent / 100)).toFixed(2);
    const confidence              = +(52 + Math.random() * 38).toFixed(1);
    return { symbol, investment, expected_return_percent, future_value, confidence };
  });

  const portfolio_future_value   = +stocks.reduce((s, x) => s + x.future_value, 0).toFixed(2);
  const portfolio_return_percent = +((portfolio_future_value - input.amount) / input.amount * 100).toFixed(2);
  return { stocks, portfolio_future_value, portfolio_return_percent };
}

// ── Normalizer ────────────────────────────────────────────────────────────────
/**
 * Backend /api/ai-stock-recommendations returns:
 * {
 *   "feature": "AI Stock Recommendations",
 *   "amount": 50000,
 *   "duration": "1 year",
 *   "market": "india",
 *   "result": {                          ← ⚠ wrapped inside "result"
 *     "stocks": [...],
 *     "portfolio_future_value": 64581.17,
 *     "portfolio_return_percent": 29.16
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeStock(r: any): StockRecommendation {
  return {
    symbol:                  r.symbol   ?? r.ticker ?? r.stock ?? '',
    investment:              Number(r.investment ?? r.amount  ?? r.allocated ?? 0),
    expected_return_percent: Number(r.expected_return_percent ?? r.return_percent ?? r.expected_return ?? r.roi ?? 0),
    future_value:            Number(r.future_value ?? r.futureValue ?? r.projected_value ?? 0),
    confidence:              Number(r.confidence   ?? r.confidence_score ?? r.score ?? 0),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeResponse(raw: any, input: RecommendationInput): RecommendationResponse {
  // ⚠ KEY FIX: your backend wraps everything inside "result" key
  const payload = raw.result ?? raw.data ?? raw;

  const rawStocks: unknown[] = payload.stocks ?? payload.recommendations ?? [];
  const stocks = rawStocks.map(normalizeStock);

  const portfolio_future_value =
    payload.portfolio_future_value ?? payload.total_future_value ?? payload.future_value ??
    stocks.reduce((s, x) => s + x.future_value, 0);

  const portfolio_return_percent =
    payload.portfolio_return_percent ?? payload.total_return_percent ?? payload.return_percent ??
    ((portfolio_future_value - input.amount) / input.amount * 100);

  return {
    stocks,
    portfolio_future_value:   +portfolio_future_value.toFixed(2),
    portfolio_return_percent: +portfolio_return_percent.toFixed(2),
  };
}

// ── Duration format mapping ───────────────────────────────────────────────────
// Frontend sends "1year" but backend may expect "1 year" — test both
const DURATION_MAP: Record<string, string> = {
  '1month':  '1 month',
  '6months': '6 months',
  '1year':   '1 year',
  '3years':  '3 years',
};

// ── Public fetch ──────────────────────────────────────────────────────────────
export async function fetchRecommendations(
  input: RecommendationInput
): Promise<{ data: RecommendationResponse; isMock: boolean }> {
  try {
    const { data } = await api.get('/api/ai-stock-recommendations', {
      params: {
        amount:   input.amount,
        duration: DURATION_MAP[input.duration] ?? input.duration, // "1 year" format
        market:   input.market,
      },
    });
    return { data: normalizeResponse(data, input), isMock: false };
  } catch {
    return { data: generateMock(input), isMock: true };
  }
}
