'use client';
import React, { useEffect, useState } from 'react';
import { Clock, TrendingUp, TrendingDown, ArrowRight, Trash2, BarChart2, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

export interface HistoryEntry {
  symbol: string;
  timestamp: string;        // ISO string
  price: number;
  predicted_price: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  risk_score: number;
  best_model: string;
}

const REC_CHIP: Record<string, string> = {
  BUY:  'chip-buy',
  SELL: 'chip-sell',
  HOLD: 'chip-hold',
};

interface Props {
  onAnalyse: (sym: string) => void;
}

export default function PreviousView({ onAnalyse }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('gnosis_history');
      if (raw) setEntries(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const clear = () => {
    localStorage.removeItem('gnosis_history');
    setEntries([]);
  };

  const remove = (idx: number) => {
    const next = entries.filter((_, i) => i !== idx);
    localStorage.setItem('gnosis_history', JSON.stringify(next));
    setEntries(next);
  };

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const upside = (e: HistoryEntry) =>
    ((e.predicted_price - e.price) / e.price) * 100;

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} style={{ color: 'var(--teal)' }} />
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--teal)' }}>Analysis History</p>
          </div>
          <h2 className="text-xl font-black" style={{ color: 'var(--txt)' }}>Previously Analysed Stocks</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--txt3)' }}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} saved locally
          </p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={clear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:border-[var(--red)] hover:text-[var(--red)]"
            style={{ border: '1px solid var(--border)', color: 'var(--txt3)' }}
          >
            <Trash2 size={12} />
            Clear all
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        /* Empty state */
        <div className="py-20 text-center rounded-2xl border" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--teal-dim)', border: '1px solid var(--teal-border)' }}>
            <BarChart2 size={24} style={{ color: 'var(--teal)' }} />
          </div>
          <p className="text-sm font-bold mb-2" style={{ color: 'var(--txt)' }}>No analyses yet</p>
          <p className="text-xs mb-5" style={{ color: 'var(--txt3)' }}>
            Search for a stock and click Analyse to get started. Your history will appear here.
          </p>
          <button
            onClick={() => onAnalyse('AAPL')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110"
            style={{ background: 'var(--teal)', color: '#080D16' }}
          >
            Analyse AAPL now <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {entries.map((e, i) => {
            const up = upside(e);
            const isPos = up >= 0;
            return (
              <div
                key={`${e.symbol}-${i}`}
                className="p-4 rounded-2xl border transition-all"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                onMouseEnter={x => (x.currentTarget.style.borderColor = 'var(--teal-border)')}
                onMouseLeave={x => (x.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black"
                      style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}>
                      {e.symbol.replace('.NS','').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--txt)' }}>{e.symbol}</p>
                      <p className="text-[10px]" style={{ color: 'var(--txt3)' }}>{fmtTime(e.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={clsx('text-[10px] font-black px-2.5 py-1 rounded-lg', REC_CHIP[e.recommendation])}>
                      {e.recommendation}
                    </span>
                    <button
                      onClick={() => remove(i)}
                      className="text-[var(--txt3)] hover:text-[var(--red)] transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Price',     value: `$${e.price.toFixed(2)}`,           color: 'var(--txt)'  },
                    { label: 'AI Target', value: `$${e.predicted_price.toFixed(2)}`, color: 'var(--teal)' },
                    { label: 'Upside',    value: `${isPos?'+':''}${up.toFixed(2)}%`, color: isPos ? 'var(--teal)' : 'var(--red)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center py-2 rounded-xl" style={{ background: 'var(--surface2)' }}>
                      <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--txt3)' }}>{label}</p>
                      <p className="text-xs font-bold font-mono" style={{ color }}>{value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--txt3)' }}>
                    <span>Model:</span>
                    <span className="font-semibold" style={{ color: 'var(--txt2)' }}>{e.best_model}</span>
                    <span>·</span>
                    <span>Risk: <span className="font-semibold" style={{ color: 'var(--yellow)' }}>{e.risk_score.toFixed(1)}</span></span>
                  </div>
                  <button
                    onClick={() => onAnalyse(e.symbol)}
                    className="flex items-center gap-1 text-[10px] font-semibold transition-colors"
                    style={{ color: 'var(--txt3)' }}
                    onMouseEnter={x => (x.currentTarget.style.color = 'var(--teal)')}
                    onMouseLeave={x => (x.currentTarget.style.color = 'var(--txt3)')}
                  >
                    <RefreshCw size={10} />
                    Re-analyse
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Utility: call this whenever an analysis completes ── */
export function saveToHistory(entry: Omit<HistoryEntry, 'timestamp'>) {
  try {
    const raw = localStorage.getItem('gnosis_history');
    const existing: HistoryEntry[] = raw ? JSON.parse(raw) : [];
    // Avoid duplicate consecutive entries for same symbol
    const latest = existing[0];
    if (latest?.symbol === entry.symbol) {
      existing[0] = { ...entry, timestamp: new Date().toISOString() };
    } else {
      existing.unshift({ ...entry, timestamp: new Date().toISOString() });
    }
    // Keep max 50 entries
    localStorage.setItem('gnosis_history', JSON.stringify(existing.slice(0, 50)));
  } catch { /* ignore */ }
}
