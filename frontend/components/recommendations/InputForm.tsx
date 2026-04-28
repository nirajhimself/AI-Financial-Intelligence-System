'use client';
import React, { useState } from 'react';
import { Clock, Sparkles, AlertCircle, ChevronDown } from 'lucide-react';
import type { RecommendationInput, Duration, Market } from '@/types/recommendations';
import { DURATION_OPTIONS, MARKET_OPTIONS } from '@/types/recommendations';

interface Props { onSubmit: (i: RecommendationInput) => void; loading: boolean }

const QUICK_INR = [10000, 25000, 50000, 100000, 500000];
const QUICK_USD = [500, 1000, 5000, 10000, 50000];

function fmtQuick(n: number, m: Market) {
  return m === 'india' ? `₹${n.toLocaleString('en-IN')}` : `$${n.toLocaleString()}`;
}

export default function InputForm({ onSubmit, loading }: Props) {
  const [amount,   setAmount]   = useState('50000');
  const [duration, setDuration] = useState<Duration>('1year');
  const [market,   setMarket]   = useState<Market>('india');
  const [err,      setErr]      = useState('');

  const sym       = market === 'india' ? '₹' : '$';
  const minAmt    = market === 'india' ? 1000 : 100;
  const quickAmts = market === 'india' ? QUICK_INR : QUICK_USD;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount.replace(/,/g, ''));
    if (!num || isNaN(num) || num < minAmt) {
      setErr(`Minimum investment is ${sym}${minAmt.toLocaleString()}`); return;
    }
    setErr('');
    onSubmit({ amount: num, duration, market });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div className="flex items-center gap-3 pb-1">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--teal-dim)', border: '1px solid var(--teal-border)' }}>
          <Sparkles size={16} style={{ color: 'var(--teal)' }} />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--txt)' }}>Configure Your Portfolio</h3>
          <p className="text-[11px]" style={{ color: 'var(--txt3)' }}>AI will allocate across top stocks for your profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Amount */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--txt3)' }}>
            Investment Amount
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: 'var(--teal)' }}>{sym}</span>
            <input
              type="text" inputMode="numeric" value={amount}
              onChange={e => { setAmount(e.target.value.replace(/[^0-9.]/g, '')); setErr(''); }}
              placeholder="50000"
              className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm font-semibold font-mono focus:outline-none transition-all"
              style={{ background: 'var(--surface2)', border: `1px solid ${err ? 'var(--red)' : 'var(--border)'}`, color: 'var(--txt)' }}
              onFocus={e => { if (!err) e.target.style.borderColor = 'var(--teal)'; }}
              onBlur={e => { if (!err) e.target.style.borderColor = 'var(--border)'; }}
            />
          </div>
          {err && <p className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--red)' }}><AlertCircle size={10} />{err}</p>}
          <div className="flex flex-wrap gap-1.5">
            {quickAmts.map(a => (
              <button key={a} type="button" onClick={() => { setAmount(String(a)); setErr(''); }}
                className="px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all"
                style={{
                  background: parseFloat(amount) === a ? 'var(--teal-dim)' : 'var(--surface2)',
                  borderColor: parseFloat(amount) === a ? 'var(--teal-border)' : 'var(--border)',
                  color: parseFloat(amount) === a ? 'var(--teal)' : 'var(--txt3)',
                }}>
                {fmtQuick(a, market)}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--txt3)' }}>Duration</label>
          <div className="relative">
            <Clock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--txt3)' }} />
            <ChevronDown size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--txt3)' }} />
            <select value={duration} onChange={e => setDuration(e.target.value as Duration)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm font-semibold appearance-none focus:outline-none transition-all cursor-pointer"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--txt)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--teal)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}>
              {DURATION_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {DURATION_OPTIONS.map(d => (
              <button key={d.value} type="button" onClick={() => setDuration(d.value)}
                className="py-1.5 rounded-lg text-[10px] font-semibold border transition-all"
                style={{
                  background: duration === d.value ? 'var(--teal-dim)' : 'var(--surface2)',
                  borderColor: duration === d.value ? 'var(--teal-border)' : 'var(--border)',
                  color: duration === d.value ? 'var(--teal)' : 'var(--txt3)',
                }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Market */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--txt3)' }}>Market</label>
          <div className="space-y-2">
            {MARKET_OPTIONS.map(m => (
              <button key={m.value} type="button"
                onClick={() => { setMarket(m.value); setAmount(m.value === 'india' ? '50000' : '5000'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-left"
                style={{
                  background: market === m.value ? 'var(--teal-dim)' : 'var(--surface2)',
                  borderColor: market === m.value ? 'var(--teal)' : 'var(--border)',
                }}>
                <span className="text-xl">{m.flag}</span>
                <div className="flex-1">
                  <p className="text-xs font-bold" style={{ color: market === m.value ? 'var(--teal)' : 'var(--txt)' }}>{m.label}</p>
                  <p className="text-[10px]" style={{ color: 'var(--txt3)' }}>{m.value === 'india' ? 'NSE · BSE · ₹ INR' : 'NYSE · NASDAQ · $ USD'}</p>
                </div>
                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: market === m.value ? 'var(--teal)' : 'var(--txt3)' }}>
                  {market === m.value && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--teal)' }} />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: 'var(--teal)', color: '#080D16' }}>
        {loading ? (
          <><span className="w-4 h-4 border-2 border-[#080D16] border-t-transparent rounded-full"
            style={{ animation: 'spin 0.7s linear infinite' }} />Analysing market data…</>
        ) : (
          <><Sparkles size={15} />Generate AI Recommendations</>
        )}
      </button>
    </form>
  );
}
