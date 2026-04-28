'use client';
import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, Zap, PieChart } from 'lucide-react';
import type { RecommendationResponse, Market } from '@/types/recommendations';

interface Props { data: RecommendationResponse; amount: number; market: Market; isMock: boolean }

function fmt(val: number, market: Market) {
  const s = market === 'india' ? '₹' : '$';
  if (market === 'india') {
    if (val >= 1_00_00_000) return `${s}${(val / 1_00_00_000).toFixed(2)}Cr`;
    if (val >= 1_00_000)    return `${s}${(val / 1_00_000).toFixed(2)}L`;
  }
  if (val >= 1_000_000) return `${s}${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000)     return `${s}${val.toLocaleString()}`;
  return `${s}${val.toFixed(2)}`;
}

export default function PortfolioSummary({ data, amount, market, isMock }: Props) {
  const isProfit = data.portfolio_return_percent >= 0;
  const gain     = data.portfolio_future_value - amount;
  const topStock = [...data.stocks].sort((a, b) => b.expected_return_percent - a.expected_return_percent)[0];

  const cards = [
    { label: 'Total Invested',        value: fmt(amount, market),                     sub: `Across ${data.stocks.length} stocks`,       icon: <Wallet size={15} />, color: 'var(--txt2)',   bg: 'var(--surface2)', border: 'var(--border)' },
    { label: 'Portfolio Future Value', value: fmt(data.portfolio_future_value, market), sub: `${gain >= 0 ? '+' : ''}${fmt(Math.abs(gain), market)} total gain`, icon: <Target size={15} />, color: isProfit ? 'var(--teal)' : 'var(--red)', bg: isProfit ? 'var(--teal-dim)' : 'var(--red-dim)', border: isProfit ? 'var(--teal-border)' : 'rgba(255,69,96,0.25)' },
    { label: 'Expected Return',        value: `${isProfit ? '+' : ''}${data.portfolio_return_percent.toFixed(2)}%`, sub: 'Weighted portfolio avg', icon: isProfit ? <TrendingUp size={15} /> : <TrendingDown size={15} />, color: isProfit ? 'var(--teal)' : 'var(--red)', bg: isProfit ? 'var(--teal-dim)' : 'var(--red-dim)', border: isProfit ? 'var(--teal-border)' : 'rgba(255,69,96,0.25)' },
    { label: 'Top Performer',          value: topStock?.symbol ?? '—',                  sub: topStock ? `+${topStock.expected_return_percent.toFixed(1)}% expected` : '', icon: <Zap size={15} />, color: 'var(--purple)', bg: 'var(--purple-dim)', border: 'rgba(129,140,248,0.25)' },
  ];

  return (
    <div className="space-y-3 fade-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart size={14} style={{ color: 'var(--teal)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--txt)' }}>Portfolio Summary</span>
        </div>
        <div className="flex items-center gap-2">
          {isMock && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)', border: '1px solid rgba(245,158,11,0.25)' }}>
              ⚠ Demo Mode
            </span>
          )}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isProfit ? 'chip-buy' : 'chip-sell'}`}>
            {isProfit ? '📈 Profitable' : '📉 Loss Risk'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="p-4 rounded-2xl border"
            style={{ background: c.bg, borderColor: c.border }}>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>{c.label}</p>
              <span style={{ color: c.color }}>{c.icon}</span>
            </div>
            <p className="text-xl font-black font-mono mb-1" style={{ color: c.color }}>{c.value}</p>
            <p className="text-[10px]" style={{ color: 'var(--txt3)' }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="card p-4">
        <div className="flex justify-between text-xs mb-2">
          <span style={{ color: 'var(--txt3)' }}>Allocation progress</span>
          <span className="font-mono font-semibold" style={{ color: isProfit ? 'var(--teal)' : 'var(--red)' }}>
            {fmt(amount, market)} → {fmt(data.portfolio_future_value, market)}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min((data.portfolio_future_value / (amount * 1.5)) * 100, 100)}%`,
              background: isProfit ? 'linear-gradient(90deg, var(--teal), #34D399)' : 'linear-gradient(90deg, var(--red), #F87171)',
            }} />
        </div>
        <div className="flex justify-between text-[10px] mt-1.5" style={{ color: 'var(--txt3)' }}>
          <span>Invested: {fmt(amount, market)}</span>
          <span className="font-semibold" style={{ color: isProfit ? 'var(--teal)' : 'var(--red)' }}>
            {isProfit ? 'Gain' : 'Loss'}: {fmt(Math.abs(gain), market)}
          </span>
        </div>
      </div>
    </div>
  );
}
