'use client';
import React from 'react';
import { Award, Target, TrendingUp, TrendingDown, Minus, Brain, Activity } from 'lucide-react';
import type { Prediction } from '@/types';
import clsx from 'clsx';

interface Props { prediction: Prediction | null; loading: boolean }

const CFG = {
  BUY:  { cls: 'chip-buy',  icon: <TrendingUp size={14} />,  label: 'Bullish — Buy Position',  desc: 'AI models indicate upward momentum. The predicted price suggests positive returns.' },
  SELL: { cls: 'chip-sell', icon: <TrendingDown size={14} />, label: 'Bearish — Sell Position', desc: 'AI models indicate downward momentum. Consider reducing exposure to limit losses.' },
  HOLD: { cls: 'chip-hold', icon: <Minus size={14} />,        label: 'Neutral — Hold Position', desc: 'AI models indicate consolidation phase. Wait for clearer directional signals.' },
};

function Sk() {
  return (
    <div className="card p-5 space-y-4">
      <div className="sk h-3 w-32" />
      <div className="sk h-16 w-full" />
      <div className="sk h-3 w-full" />
      <div className="sk h-3 w-3/4" />
    </div>
  );
}

export default function RecommendationPanel({ prediction, loading }: Props) {
  const rec = (prediction?.recommendation ?? 'HOLD') as 'BUY' | 'SELL' | 'HOLD';
  const cfg = CFG[rec];

  const upside = prediction
    ? ((prediction.predicted_price - prediction.current_price) / prediction.current_price) * 100
    : 0;
  const sentPct = prediction?.sentiment_score ?? 0; // backend returns direct value like 32.8

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Sk /><Sk />
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 fade-up">
      {/* AI Recommendation */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award size={13} className="text-[var(--txt3)]" />
          <span className="text-[10px] uppercase tracking-widest font-semibold text-[var(--txt3)]">AI Recommendation</span>
        </div>

        <div className={clsx('flex items-center justify-between px-4 py-3.5 rounded-xl mb-4', cfg.cls)}>
          <div className="flex items-center gap-2">
            {cfg.icon}
            <span className="text-sm font-bold">{cfg.label}</span>
          </div>
          <span className="text-2xl font-black tracking-widest">{rec}</span>
        </div>

        <p className="text-xs text-[var(--txt2)] leading-relaxed mb-4">{cfg.desc}</p>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Predicted', value: prediction?.predicted_price ? `$${prediction.predicted_price.toFixed(2)}` : '—', color: 'var(--teal)' },
            { label: 'Upside',    value: `${upside >= 0 ? '+' : ''}${upside.toFixed(2)}%`, color: upside >= 0 ? 'var(--teal)' : 'var(--red)' },
            { label: 'Risk',      value: prediction?.risk_score ? `${prediction.risk_score.toFixed(1)}%` : '—', color: 'var(--yellow)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center p-2.5 rounded-xl bg-[var(--surface2)]">
              <p className="text-[9px] text-[var(--txt3)] uppercase tracking-wider">{label}</p>
              <p className="text-sm font-bold font-mono mt-1" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Breakdown */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={13} className="text-[var(--txt3)]" />
          <span className="text-[10px] uppercase tracking-widest font-semibold text-[var(--txt3)]">Model Analysis</span>
        </div>

        <div className="space-y-4">
          {/* ML Model info */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface2)]">
            <div className="flex items-center gap-2.5">
              <Activity size={14} className="text-[var(--teal)]" />
              <div>
                <p className="text-xs font-semibold text-[var(--txt)]">{prediction?.best_model ?? 'LinearRegression'}</p>
                <p className="text-[10px] text-[var(--txt3)]">Best performing model</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded chip-buy">Auto-selected</span>
          </div>

          {/* Current vs Predicted */}
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[var(--txt3)]">Current Price</span>
              <span className="font-mono font-semibold text-[var(--txt)]">${prediction?.current_price?.toFixed(2) ?? '—'}</span>
            </div>
            <div className="flex justify-between text-xs mb-3">
              <span className="text-[var(--txt3)]">Predicted Price</span>
              <span className="font-mono font-semibold text-[var(--teal)]">${prediction?.predicted_price?.toFixed(2) ?? '—'}</span>
            </div>
            {/* Price gap bar */}
            <div className="h-1.5 rounded-full bg-[var(--surface2)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(Math.abs(upside) * 5, 100)}%`,
                  background: upside >= 0 ? 'var(--teal)' : 'var(--red)',
                }}
              />
            </div>
            <p className="text-[10px] text-[var(--txt3)] mt-1">
              {Math.abs(upside).toFixed(2)}% {upside >= 0 ? 'expected gain' : 'expected loss'}
            </p>
          </div>

          {/* Sentiment */}
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] text-[var(--txt3)]">Market Sentiment</span>
              <span className="text-[10px] font-semibold" style={{ color: sentPct >= 0 ? 'var(--teal)' : 'var(--red)' }}>
                {sentPct > 0 ? '+' : ''}{sentPct.toFixed(2)}%
              </span>
            </div>
            <div className="relative h-1.5 rounded-full bg-[var(--surface2)] overflow-hidden">
              <div
                className="absolute top-0 h-full rounded-full"
                style={{
                  left: sentPct >= 0 ? '50%' : `${50 - Math.min(Math.abs(sentPct / 1.5), 50)}%`,
                  width: `${Math.min(Math.abs(sentPct / 1.5), 50)}%`,
                  background: sentPct >= 0 ? 'var(--teal)' : 'var(--red)',
                }}
              />
              <div className="absolute top-0 left-1/2 w-px h-full bg-[var(--txt3)]/30" />
            </div>
          </div>

          {/* Risk level */}
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] text-[var(--txt3)]">Risk Score</span>
              <span className="text-[10px] font-semibold text-[var(--yellow)]">
                {prediction?.risk_score?.toFixed(2) ?? '—'} / 100
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--surface2)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${((prediction?.risk_score ?? 0) / 10) * 100}%`,
                  background: (prediction?.risk_score ?? 0) <= 10 ? 'var(--teal)' : (prediction?.risk_score ?? 0) <= 30 ? 'var(--yellow)' : 'var(--red)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
