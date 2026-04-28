'use client';
import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { fetchAllPrices } from '@/services/api';
import type { StockPrice } from '@/types';
import clsx from 'clsx';

const SYMBOLS = ['AAPL', 'TSLA', 'MSFT', 'GOOG', 'AMZN', 'NVDA', 'META', 'AMD', 'NFLX', 'INTC', 'JPM'];

export default function TickerTape() {
  const [prices, setPrices] = useState<StockPrice[]>([]);

  useEffect(() => {
    const load = async () => { const d = await fetchAllPrices(SYMBOLS); setPrices(d); };
    load();
    const iv = setInterval(load, 25000);
    return () => clearInterval(iv);
  }, []);

  const items = [...prices, ...prices];
  if (!prices.length) return (
    <div className="h-8 bg-[var(--surface)] border-b border-[var(--border)] flex items-center px-4 overflow-hidden gap-8">
      {SYMBOLS.slice(0, 6).map(s => <div key={s} className="sk h-3 w-28 flex-shrink-0" />)}
    </div>
  );

  return (
    <div className="h-8 bg-[var(--surface)] border-b border-[var(--border)] overflow-hidden flex items-center">
      <div className="ticker-track gap-8 px-6">
        {items.map((p, i) => {
          const pos = p.change_pct >= 0;
          return (
            <div key={`${p.symbol}-${i}`} className="flex items-center gap-1.5 flex-shrink-0 select-none">
              <span className="text-[11px] font-semibold text-[var(--txt)]">{p.symbol}</span>
              <span className="text-[11px] font-mono text-[var(--txt2)]">${p.price.toFixed(2)}</span>
              <span className={clsx('text-[10px] font-mono flex items-center gap-0.5', pos ? 'text-[var(--teal)]' : 'text-[var(--red)]')}>
                {pos ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                {pos ? '+' : ''}{p.change_pct.toFixed(2)}%
              </span>
              <span className="text-[var(--txt3)] text-xs ml-1">·</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
