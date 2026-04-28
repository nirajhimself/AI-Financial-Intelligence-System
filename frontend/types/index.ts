// ── GET /price response ───────────────────────────────────────────────────────
// Backend: { "symbol": "RVNL.NS", "price": 303.06, "change": 9.17, "change_pct": 3.12 }
export interface StockPrice {
  symbol:     string;
  price:      number;
  change:     number;
  change_pct: number;
}

// ── GET /history response items ───────────────────────────────────────────────
// Backend only returns: { "date": "2025-04-17", "close": 367.76 }
// open, high, low, volume are optional — filled in by normalizer
export interface HistoryPoint {
  date:    string;
  close:   number;
  open?:   number;
  high?:   number;
  low?:    number;
  volume?: number;
}

// ── GET /predict response (normalized from backend) ───────────────────────────
// Backend actual fields:
//   current_price, ml_prediction, rule_prediction, final_prediction,
//   best_model, sentiment_score (0–100 scale), sentiment_label,
//   indicator_signal, accuracy, recommendation
// We normalize these to a consistent shape:
export interface Prediction {
  current_price:    number;
  predicted_price:  number;  // ← mapped from final_prediction
  best_model:       string;  // ← direct match
  risk_score:       number;  // ← derived: (100 - accuracy) so higher accuracy = lower risk
  sentiment_score:  number;  // ← normalized to -100..+100 scale
  sentiment_label:  string;  // ← new: "Positive" / "Negative" / "Neutral"
  indicator_signal: string;  // ← new: "BUY" / "SELL" / "HOLD" from technical indicators
  accuracy:         number;  // ← raw accuracy from backend
  ml_prediction:    number;  // ← raw ML model prediction
  rule_prediction:  number;  // ← raw rule-based prediction
  recommendation:   'BUY' | 'SELL' | 'HOLD'; // ← direct match
}

// ── POST /chat ────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id:        string;
  role:      'user' | 'assistant';
  content:   string;
  timestamp: Date;
}

export type Signal    = 'BUY' | 'SELL' | 'HOLD';
export type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
export type Theme     = 'dark' | 'light';
