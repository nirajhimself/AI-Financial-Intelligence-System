import axios, { AxiosError } from "axios";
import type {
  StockPrice,
  HistoryPoint,
  Prediction,
  ChatMessage,
} from "@/types";

// ── Axios instance ─────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
});

// ── Error handler ──────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const msg =
      (err.response?.data as { detail?: string })?.detail || err.message;
    return Promise.reject(new Error(msg));
  },
);

// ── STRICT NORMALIZER (NO LOGIC, ONLY MAPPING) ─────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePrediction(raw: any): Prediction {
  if (!raw) throw new Error("Invalid backend response");

  // 🔥 HARD VALIDATION (prevents UI corruption)
  if (raw.final_prediction === undefined || raw.current_price === undefined) {
    console.error("❌ INVALID BACKEND DATA:", raw);
    throw new Error("Backend response missing required fields");
  }

  return {
    // ── CORE VALUES (ONLY BACKEND TRUTH) ─────────────────────
    current_price: Number(raw.current_price),
    predicted_price: Number(raw.final_prediction),

    ml_prediction: Number(raw.ml_prediction),
    rule_prediction: Number(raw.rule_prediction),

    best_model: String(raw.best_model),

    accuracy: Number(raw.accuracy),

    // ── DERIVED (ONLY SAFE CALCULATION) ──────────────────────
    risk_score: +(100 - Number(raw.accuracy)).toFixed(2),

    sentiment_score: Number(raw.sentiment_score),

    // 🔥 DO NOT CALCULATE — TRUST BACKEND ONLY
    sentiment_label: String(raw.sentiment_label),

    indicator_signal: String(raw.indicator_signal).toUpperCase(),

    // 🔥 CRITICAL — NO FALLBACKS
    recommendation: String(raw.recommendation).toUpperCase() as
      | "BUY"
      | "SELL"
      | "HOLD",
  };
}

// ── HISTORY NORMALIZER ─────────────────────────────────────────
function normalizeHistoryPoint(raw: Record<string, unknown>): HistoryPoint {
  const close = Number(raw.close ?? 0);

  return {
    date: String(raw.date ?? ""),
    close: +close.toFixed(2),
    open: +close.toFixed(2),
    high: +(close * 1.005).toFixed(2),
    low: +(close * 0.995).toFixed(2),
    volume: Number(raw.volume ?? 0),
  };
}

// ── API FUNCTIONS ─────────────────────────────────────────────

// ✅ PRICE
export async function fetchPrice(symbol: string): Promise<StockPrice> {
  const { data } = await api.get("/price", {
    params: { symbol },
    headers: { "Cache-Control": "no-cache" },
  });

  return {
    symbol: data.symbol,
    price: Number(data.price),
    change: Number(data.change),
    change_pct: Number(data.change_pct),
  };
}

// ✅ HISTORY
export async function fetchHistory(symbol: string): Promise<HistoryPoint[]> {
  const { data } = await api.get("/history", {
    params: { symbol },
    headers: { "Cache-Control": "no-cache" },
  });

  if (!Array.isArray(data)) return [];

  return data.map(normalizeHistoryPoint);
}

// ✅ PREDICTION (MAIN FIX)
export async function fetchPrediction(symbol: string): Promise<Prediction> {
  try {
    const { data } = await api.get("/predict", {
      params: { symbol, t: Date.now() }, // 🔥 FORCE NO CACHE
    });

    console.log("🔥 RAW BACKEND:", data);

    const normalized = normalizePrediction(data);

    console.log("✅ NORMALIZED:", normalized);

    return normalized;
  } catch (err) {
    console.error("❌ Prediction API failed:", err);
    throw err;
  }
}

// ✅ CHAT
export async function sendChatMessage(
  message: string,
  _history: ChatMessage[],
): Promise<string> {
  const { data } = await api.post<{ response: string }>("/chat", null, {
    params: { message },
  });

  return data.response;
}

// ✅ ASK
export async function askQuestion(q: string): Promise<string> {
  const { data } = await api.get<{ answer: string }>("/ask", {
    params: { q },
  });
  return data.answer;
}

// ✅ MULTI PRICE
export async function fetchAllPrices(symbols: string[]): Promise<StockPrice[]> {
  const results = await Promise.all(symbols.map(fetchPrice));
  return results;
}

// ✅ HEALTH CHECK
export async function checkBackendHealth(): Promise<boolean> {
  try {
    await api.get("/", { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

export default api;
