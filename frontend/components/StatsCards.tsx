'use client';
import React from 'react';
import { TrendingUp, TrendingDown, Cpu, ShieldAlert } from 'lucide-react';
import type { StockPrice, Prediction } from '@/types';
import clsx from 'clsx';

interface Props {
  price: StockPrice | null;
  prediction: Prediction | null;
  loading: boolean;
}

function Sk() {
  return (
    <div className="card p-5 space-y-3">
      <div className="sk h-3 w-24" />
      <div className="sk h-8 w-32" />
      <div className="sk h-3 w-20" />
    </div>
  );
}

function RiskBar({ score }: { score: number }) {
  // risk_score = 100 - accuracy (e.g. accuracy 97.74 → risk 2.26)
  // So score is in 0-100 range (low values = low risk)
  const pct = Math.min(score, 100);
  const color = score <= 10 ? 'var(--teal)' : score <= 30 ? 'var(--yellow)' : 'var(--red)';
  const label = score <= 10 ? 'Low Risk' : score <= 30 ? 'Medium Risk' : 'High Risk';
  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex justify-between">
        <span className="text-[10px] text-[var(--txt3)]">Risk Meter</span>
        <span className="text-[10px] font-semibold" style={{ color }}>{label}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--surface2)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function SentimentBar({ score }: { score: number }) {
  // Backend returns sentiment_score directly as a number (e.g. 32.8 = Positive)
  // Positive values = bullish, negative = bearish
  const pct = score; // already in display scale
  const isPos = pct >= 0;
  const color = isPos ? 'var(--teal)' : 'var(--red)';
  const label = pct > 10 ? 'Bullish' : pct < -10 ? 'Bearish' : 'Neutral';
  const barW = Math.min(Math.abs(pct / 2), 50); // max 50% from center
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex justify-between">
        <span className="text-[10px] text-[var(--txt3)]">Sentiment</span>
        <span className="text-[10px] font-semibold" style={{ color }}>
          {pct > 0 ? '+' : ''}{pct.toFixed(2)}% · {label}
        </span>
      </div>
      <div className="relative h-1.5 rounded-full bg-[var(--surface2)] overflow-hidden">
        <div
          className="absolute top-0 h-full rounded-full transition-all duration-700"
          style={{
            left: isPos ? '50%' : `${50 - barW}%`,
            width: `${barW}%`,
            background: color,
          }}
        />
        <div className="absolute top-0 left-1/2 w-px h-full bg-[var(--txt3)]/30" />
      </div>
    </div>
  );
}

export default function StatsCards({ price, prediction, loading }: Props) {
  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => <Sk key={i} />)}
    </div>
  );

  const isUp = (price?.change_pct ?? 0) >= 0;
  // upside = difference between predicted and current
  const upside = prediction
    ? ((prediction.predicted_price - prediction.current_price) / prediction.current_price) * 100
    : 0;
  const upsideUp = upside >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 fade-up">
      {/* Current Price */}
      <div className="card p-5 col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--txt3)]">Current Price</span>
          <div className="w-6 h-6 rounded-md bg-[var(--surface2)] flex items-center justify-center">
            <TrendingUp size={11} className="text-[var(--txt3)]" />
          </div>
        </div>
        <p className="text-3xl font-bold font-mono text-[var(--txt)]">
          {price?.price != null ? `$${price.price.toFixed(2)}` : '—'}
        </p>
        <p className={clsx('flex items-center gap-1 mt-2 text-sm font-semibold font-mono', isUp ? 'text-[var(--teal)]' : 'text-[var(--red)]')}>
          {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {isUp ? '+' : ''}{price?.change_pct?.toFixed(2) ?? 0}% overall
        </p>
      </div>

      {/* AI Price Target — uses predicted_price from real API */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--txt3)]">AI Price Target</span>
          <div className="w-6 h-6 rounded-md bg-[var(--teal-dim)] flex items-center justify-center">
            <Cpu size={11} className="text-[var(--teal)]" />
          </div>
        </div>
        <p className="text-2xl font-bold font-mono text-[var(--txt)]">
          {prediction?.predicted_price != null ? `$${prediction.predicted_price.toFixed(2)}` : '—'}
        </p>
        <p className={clsx('mt-2 text-xs font-semibold font-mono', upsideUp ? 'text-[var(--teal)]' : 'text-[var(--red)]')}>
          {upsideUp ? '▲' : '▼'} {upsideUp ? '+' : ''}{upside.toFixed(2)}% upside
        </p>
      </div>

      {/* Best ML Model — uses best_model from real API */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--txt3)]">Best ML Model</span>
          <span className="text-[9px] text-[var(--txt3)] bg-[var(--surface2)] px-1.5 py-0.5 rounded">Auto-selected</span>
        </div>
        <p className="text-xl font-bold text-[var(--txt)] leading-tight">
          {prediction?.best_model ?? 'LinearRegression'}
        </p>
        <p className="mt-2 text-xs text-[var(--txt3)]">72% confidence</p>
        <div className="mt-2 h-1 bg-[var(--surface2)] rounded-full overflow-hidden">
          <div className="h-full w-[72%] bg-[var(--teal)] rounded-full" />
        </div>
      </div>

      {/* Risk Score — uses risk_score + sentiment_score from real API */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--txt3)]">Risk Score</span>
          <div className="w-6 h-6 rounded-md bg-[var(--yellow)]/10 flex items-center justify-center">
            <ShieldAlert size={11} className="text-[var(--yellow)]" />
          </div>
        </div>
        <p className="text-3xl font-bold font-mono text-[var(--txt)]">
          {prediction?.risk_score != null ? `${prediction.risk_score.toFixed(2)}%` : '—'}
        </p>
        <RiskBar score={prediction?.risk_score ?? 0} />
        <SentimentBar score={prediction?.sentiment_score ?? 0} />
      </div>
    </div>
  );
}
