'use client';
import React from 'react';
import { TrendingUp, TrendingDown, ChevronUp, ChevronDown, Star } from 'lucide-react';
import type { StockRecommendation, Market, SortKey } from '@/types/recommendations';

interface Props {
  stocks: StockRecommendation[]; sortBy: SortKey; sortAsc: boolean;
  onSort: (k: SortKey) => void; market: Market; total: number; topSymbol: string;
}

function fmt(v: number, m: Market) {
  const s = m === 'india' ? '₹' : '$';
  if (m === 'india' && v >= 1_00_000) return `${s}${(v / 1_00_000).toFixed(2)}L`;
  if (v >= 1000) return `${s}${v.toLocaleString()}`;
  return `${s}${v.toFixed(2)}`;
}

const COLS: { key: SortKey; label: string }[] = [
  { key: 'investment',              label: 'Invested'     },
  { key: 'expected_return_percent', label: 'Return %'     },
  { key: 'future_value',            label: 'Future Value' },
  { key: 'confidence',              label: 'Confidence'   },
];

export default function StockTable({ stocks, sortBy, sortAsc, onSort, market, total, topSymbol }: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>
                Rank · Stock
              </th>
              {COLS.map(c => (
                <th key={c.key} onClick={() => onSort(c.key)}
                  className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  style={{ color: sortBy === c.key ? 'var(--teal)' : 'var(--txt3)' }}>
                  <span className="flex items-center justify-end gap-1">
                    {c.label}
                    <span className="flex flex-col -space-y-0.5">
                      <ChevronUp size={9} style={{ opacity: sortBy === c.key && !sortAsc ? 1 : 0.3 }} />
                      <ChevronDown size={9} style={{ opacity: sortBy === c.key && sortAsc ? 1 : 0.3 }} />
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stocks.map((s, i) => {
              const isProfit  = s.expected_return_percent >= 0;
              const isTop     = s.symbol === topSymbol;
              const alloc     = (s.investment / total) * 100;
              const confColor = s.confidence >= 75 ? 'var(--teal)' : s.confidence >= 55 ? 'var(--yellow)' : 'var(--red)';
              return (
                <tr key={s.symbol} style={{ borderBottom: '1px solid var(--border)', background: isTop ? 'rgba(0,212,200,0.04)' : 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = isTop ? 'rgba(0,212,200,0.04)' : 'transparent')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black"
                        style={{ background: isTop ? 'var(--teal)' : 'var(--surface2)', color: isTop ? '#080D16' : 'var(--txt2)' }}>{i+1}</div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold" style={{ color: 'var(--txt)' }}>{s.symbol}</span>
                          {isTop && <Star size={9} style={{ color: 'var(--teal)' }} fill="var(--teal)" />}
                        </div>
                        <span style={{ color: 'var(--txt3)' }}>{alloc.toFixed(1)}% portfolio</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold" style={{ color: 'var(--txt)' }}>{fmt(s.investment, market)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold ${isProfit ? 'chip-buy' : 'chip-sell'}`}>
                      {isProfit ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                      {isProfit ? '+' : ''}{s.expected_return_percent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold" style={{ color: isProfit ? 'var(--teal)' : 'var(--red)' }}>
                    {fmt(s.future_value, market)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
                        <div className="h-full rounded-full" style={{ width: `${s.confidence}%`, background: confColor }} />
                      </div>
                      <span className="font-mono font-bold" style={{ color: confColor }}>{s.confidence.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
