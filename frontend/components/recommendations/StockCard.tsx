'use client';
import React from 'react';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import type { StockRecommendation, Market } from '@/types/recommendations';

interface Props { stock: StockRecommendation; rank: number; isTop: boolean; market: Market; total: number }

function fmt(v: number, m: Market) {
  const s = m === 'india' ? '₹' : '$';
  if (m === 'india' && v >= 1_00_000) return `${s}${(v / 1_00_000).toFixed(2)}L`;
  if (v >= 1000) return `${s}${v.toLocaleString()}`;
  return `${s}${v.toFixed(2)}`;
}

export default function StockCard({ stock, rank, isTop, market, total }: Props) {
  const isProfit  = stock.expected_return_percent >= 0;
  const alloc     = (stock.investment / total) * 100;
  const gain      = stock.future_value - stock.investment;
  const confColor = stock.confidence >= 75 ? 'var(--teal)' : stock.confidence >= 55 ? 'var(--yellow)' : 'var(--red)';
  const confLabel = stock.confidence >= 75 ? 'High' : stock.confidence >= 55 ? 'Medium' : 'Low';

  return (
    <div className="card p-4 relative overflow-hidden transition-all duration-200 hover:scale-[1.015]"
      style={{ borderColor: isTop ? 'var(--teal)' : undefined }}>
      {isTop && (
        <div className="absolute top-0 right-0 flex items-center gap-1 px-2.5 py-1 rounded-bl-xl text-[10px] font-bold"
          style={{ background: 'var(--teal)', color: '#080D16' }}>
          <Star size={9} strokeWidth={3} />TOP PICK
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
            style={{ background: isTop ? 'var(--teal)' : 'var(--surface2)', color: isTop ? '#080D16' : 'var(--txt2)' }}>
            #{rank}
          </div>
          <div>
            <p className="text-sm font-black" style={{ color: 'var(--txt)' }}>{stock.symbol}</p>
            <p className="text-[10px]" style={{ color: 'var(--txt3)' }}>{alloc.toFixed(1)}% of portfolio</p>
          </div>
        </div>
        <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-lg ${isProfit ? 'chip-buy' : 'chip-sell'}`}>
          {isProfit ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {isProfit ? '+' : ''}{stock.expected_return_percent.toFixed(2)}%
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {[
          { label: 'Invested',     value: fmt(stock.investment, market),   color: 'var(--txt)'  },
          { label: 'Future',       value: fmt(stock.future_value, market),  color: isProfit ? 'var(--teal)' : 'var(--red)' },
          { label: 'Gain/Loss',    value: `${gain >= 0 ? '+' : ''}${fmt(Math.abs(gain), market)}`, color: gain >= 0 ? 'var(--teal)' : 'var(--red)' },
        ].map(m => (
          <div key={m.label} className="text-center py-2 rounded-xl" style={{ background: 'var(--surface2)' }}>
            <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--txt3)' }}>{m.label}</p>
            <p className="text-[11px] font-bold font-mono" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Confidence */}
      <div className="mb-2">
        <div className="flex justify-between text-[10px] mb-1">
          <span style={{ color: 'var(--txt3)' }}>AI Confidence</span>
          <span className="font-bold" style={{ color: confColor }}>{stock.confidence.toFixed(1)}% · {confLabel}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${stock.confidence}%`, background: confColor }} />
        </div>
      </div>

      {/* Portfolio weight */}
      <div>
        <div className="flex justify-between text-[10px] mb-1">
          <span style={{ color: 'var(--txt3)' }}>Portfolio weight</span>
          <span className="font-semibold" style={{ color: 'var(--txt2)' }}>{alloc.toFixed(1)}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
          <div className="h-full rounded-full" style={{ width: `${alloc}%`, background: 'linear-gradient(90deg, var(--teal), rgba(0,212,200,0.4))' }} />
        </div>
      </div>
    </div>
  );
}
