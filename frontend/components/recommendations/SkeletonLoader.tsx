'use client';
import React from 'react';
import { Brain } from 'lucide-react';

export default function SkeletonLoader() {
  return (
    <div className="space-y-5 fade-up">
      <div className="card p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--teal-dim)', border: '1px solid var(--teal-border)' }}>
          <Brain size={20} style={{ color: 'var(--teal)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold" style={{ color: 'var(--txt)' }}>AI is analysing market data</p>
            <span className="flex gap-0.5">
              {[0, 0.2, 0.4].map((d, i) => (
                <span key={i} className="w-1 h-1 rounded-full"
                  style={{ background: 'var(--teal)', animation: `pulse 1s ${d}s ease-in-out infinite` }} />
              ))}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
            <div className="h-full rounded-full sk" style={{ width: '65%' }} />
          </div>
          <p className="text-[11px]" style={{ color: 'var(--txt3)' }}>Running ML models · Scoring confidence · Optimising allocations…</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-4 space-y-3">
            <div className="sk h-3 w-20" /><div className="sk h-6 w-28" /><div className="sk h-2.5 w-16" />
          </div>
        ))}
      </div>

      <div className="card p-5 space-y-3">
        <div className="sk h-4 w-40" /><div className="sk h-48 w-full rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5"><div className="sk w-8 h-8 rounded-lg" /><div className="space-y-1"><div className="sk h-3 w-20" /><div className="sk h-2.5 w-14" /></div></div>
              <div className="sk h-5 w-14 rounded-lg" />
            </div>
            <div className="grid grid-cols-3 gap-1.5">{[...Array(3)].map((__, j) => <div key={j} className="sk h-10 rounded-xl" />)}</div>
            <div className="sk h-2 w-full rounded-full" /><div className="sk h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
