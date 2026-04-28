'use client';
import React from 'react';
import {
  TrendingUp, Brain, Activity, Shield, BarChart2,
  Newspaper, ArrowRight, Zap, Star, Users, Globe
} from 'lucide-react';

interface Props {
  onGetStarted: () => void;
  onAnalyse: (sym: string) => void;
}

const FEATURES = [
  {
    icon: <TrendingUp size={20} />,
    title: 'Real-time Stock Data',
    desc: 'Live prices, volume, and market data pulled directly from exchanges.',
    color: 'var(--teal)',
  },
  {
    icon: <Brain size={20} />,
    title: 'AI Price Prediction',
    desc: 'LinearRegression & ML models forecast where a stock is headed.',
    color: '#818CF8',
  },
  {
    icon: <Newspaper size={20} />,
    title: 'Sentiment Analysis',
    desc: 'News & social signals scored into a single sentiment index.',
    color: '#F59E0B',
  },
  {
    icon: <BarChart2 size={20} />,
    title: 'Technical Indicators',
    desc: 'RSI, MACD, EMA built into every analysis automatically.',
    color: '#34D399',
  },
  {
    icon: <Activity size={20} />,
    title: 'Historical Charts',
    desc: 'Interactive price history with 1W → ALL range selectors.',
    color: '#60A5FA',
  },
  {
    icon: <Shield size={20} />,
    title: 'Risk Analysis Engine',
    desc: 'Proprietary risk score from 0–10 to size your position safely.',
    color: '#F87171',
  },
];

const TRENDING = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOG', 'AMZN', 'META', 'RVNL.NS'];

const STATS = [
  { icon: <Users size={16} />,  label: 'Active Traders',  value: '12,400+' },
  { icon: <Globe size={16} />,  label: 'Markets Covered', value: '40+'     },
  { icon: <Star size={16} />,   label: 'Avg Accuracy',    value: '82%'     },
  { icon: <Zap size={16} />,    label: 'Data Latency',    value: '<1s'     },
];

export default function HomeView({ onGetStarted, onAnalyse }: Props) {
  return (
    <div className="space-y-0">
      {/* ── Hero ── */}
      <section className="relative px-6 py-20 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(ellipse, var(--teal) 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border"
            style={{ background: 'var(--teal-dim)', border: '1px solid var(--teal-border)', color: 'var(--teal)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--teal)' }} />
            AI-Powered Market Intelligence
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-black leading-tight" style={{ color: 'var(--txt)' }}>
            Predict the Future of{' '}
            <span style={{ color: 'var(--teal)' }}>Stock Markets</span>
          </h1>

          <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--txt2)' }}>
            Harness the power of advanced machine learning to make data-driven investment decisions with unprecedented accuracy.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 hover:brightness-110"
              style={{ background: 'var(--teal)', color: '#080D16' }}
            >
              Start Predicting <ArrowRight size={15} />
            </button>
            <button
              onClick={() => onAnalyse('AAPL')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border transition-all hover:border-[var(--teal)] hover:text-[var(--teal)]"
              style={{ border: '1px solid var(--border)', color: 'var(--txt2)' }}
            >
              Explore Demo
            </button>
          </div>

          {/* Floating ticker cards */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {[
              { sym: 'AAPL', chg: '+2.34%', pos: true  },
              { sym: 'NVDA', chg: '+5.12%', pos: true  },
              { sym: 'TSLA', chg: '-1.20%', pos: false },
            ].map(t => (
              <button
                key={t.sym}
                onClick={() => onAnalyse(t.sym)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all hover:border-[var(--teal-border)]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--txt)' }}
              >
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: t.pos ? 'var(--teal-dim)' : 'var(--red-dim)' }}>
                  <TrendingUp size={10} style={{ color: t.pos ? 'var(--teal)' : 'var(--red)' }} />
                </div>
                {t.sym}
                <span style={{ color: t.pos ? 'var(--teal)' : 'var(--red)' }}>{t.chg}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y px-6 py-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: 'var(--teal)' }}>
                {s.icon}
              </div>
              <p className="text-2xl font-black" style={{ color: 'var(--txt)' }}>{s.value}</p>
              <p className="text-[11px]" style={{ color: 'var(--txt3)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="px-6 py-14">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--teal)' }}>What We Offer</p>
            <h2 className="text-2xl font-black" style={{ color: 'var(--txt)' }}>
              Everything you need to trade smarter
            </h2>
            <p className="text-sm mt-2 max-w-lg mx-auto" style={{ color: 'var(--txt2)' }}>
              One platform combining real-time data, machine learning, and risk management.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div
                key={f.title}
                className="p-5 rounded-2xl border transition-all hover:scale-[1.02] cursor-default"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--teal-border)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${f.color}18`, color: f.color }}>
                  {f.icon}
                </div>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--txt)' }}>{f.title}</p>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--txt2)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending stocks ── */}
      <section className="px-6 pb-14">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--teal)' }}>Trending Now</p>
              <h3 className="text-lg font-black" style={{ color: 'var(--txt)' }}>Popular Stocks to Analyse</h3>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {TRENDING.map(sym => (
              <button
                key={sym}
                onClick={() => onAnalyse(sym)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--txt2)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--teal-border)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--teal)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--txt2)';
                }}
              >
                <div className="w-6 h-6 rounded-md text-[9px] font-black flex items-center justify-center"
                  style={{ background: 'var(--teal-dim)', color: 'var(--teal)' }}>
                  {sym.replace('.NS','').slice(0, 2)}
                </div>
                {sym}
                <ArrowRight size={12} />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
