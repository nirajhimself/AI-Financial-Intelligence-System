'use client';
import React, { useState, useCallback } from 'react';
import {
  Brain, Sparkles, AlertTriangle, X,
  LayoutGrid, Table2, SortAsc, SortDesc,
  RefreshCw, ChevronDown,
} from 'lucide-react';

import InputForm        from '@/components/recommendations/InputForm';
import PortfolioSummary from '@/components/recommendations/PortfolioSummary';
import StockCard        from '@/components/recommendations/StockCard';
import StockTable       from '@/components/recommendations/StockTable';
import SkeletonLoader   from '@/components/recommendations/SkeletonLoader';
import RecommendationChart from '@/components/recommendations/RecommendationChart';

import { fetchRecommendations } from '@/services/recommendations';
import type {
  RecommendationInput,
  RecommendationResponse,
  SortKey,
  Market,
} from '@/types/recommendations';

type ViewMode = 'cards' | 'table';

export default function AIPicksView() {
  const [lastInput, setLastInput] = useState<RecommendationInput | null>(null);
  const [data,      setData]      = useState<RecommendationResponse | null>(null);
  const [isMock,    setIsMock]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const [view,    setView]    = useState<ViewMode>('cards');
  const [sortBy,  setSortBy]  = useState<SortKey>('expected_return_percent');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSubmit = useCallback(async (input: RecommendationInput) => {
    setLoading(true);
    setError(null);
    setData(null);
    setLastInput(input);
    try {
      const res = await fetchRecommendations(input);
      if (!res.data.stocks.length) {
        setError('No stocks returned. Try adjusting your parameters.');
      } else {
        setData(res.data);
        setIsMock(res.isMock);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const sorted = data
    ? [...data.stocks].sort((a, b) => {
        const d = a[sortBy] - b[sortBy];
        return sortAsc ? d : -d;
      })
    : [];

  const topSymbol = data?.stocks.length
    ? [...data.stocks].sort((a, b) => b.expected_return_percent - a.expected_return_percent)[0].symbol
    : '';

  const handleSort = (key: SortKey) => {
    if (key === sortBy) setSortAsc(p => !p);
    else { setSortBy(key); setSortAsc(false); }
  };

  const mkt: Market = lastInput?.market ?? 'india';

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">

      {/* ── Section header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain size={16} style={{ color: 'var(--teal)' }} />
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--teal)' }}>
              AI Picks
            </p>
          </div>
          <h2 className="text-xl font-black" style={{ color: 'var(--txt)' }}>
            AI Stock Recommendation Engine
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--txt3)' }}>
            Configure your investment profile and let AI allocate your portfolio across top-performing stocks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {data && (
            <button onClick={() => lastInput && handleSubmit(lastInput)} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
              style={{ border: '1px solid var(--border)', color: 'var(--txt2)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--teal-border)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          )}
          <div className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full"
            style={{ background: 'var(--teal-dim)', border: '1px solid var(--teal-border)', color: 'var(--teal)' }}>
            <Sparkles size={10} />
            Powered by ML
          </div>
        </div>
      </div>

      {/* ── Input form ── */}
      <InputForm onSubmit={handleSubmit} loading={loading} />

      {/* ── Error ── */}
      {error && !loading && (
        <div className="flex items-start gap-3 p-4 rounded-2xl text-sm fade-up"
          style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,69,96,0.25)', color: 'var(--red)' }}>
          <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-xs mb-0.5">Could not load recommendations</p>
            <p className="text-[11px] opacity-80">{error}</p>
          </div>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* ── Skeleton ── */}
      {loading && <SkeletonLoader />}

      {/* ── Results ── */}
      {data && !loading && (
        <div className="space-y-5 fade-up">

          {/* Summary cards */}
          <PortfolioSummary data={data} amount={lastInput!.amount} market={mkt} isMock={isMock} />

          {/* Chart */}
          <RecommendationChart stocks={data.stocks} market={mkt} />

          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-sm font-bold" style={{ color: 'var(--txt)' }}>
                Recommended Stocks
                <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--teal-dim)', color: 'var(--teal)', border: '1px solid var(--teal-border)' }}>
                  {sorted.length} stocks
                </span>
              </span>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--txt3)' }}>
                Sorted by {sortBy.replace(/_/g, ' ')} · {sortAsc ? 'Asc' : 'Desc'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort select */}
              <div className="relative">
                <select value={sortBy} onChange={e => { setSortBy(e.target.value as SortKey); setSortAsc(false); }}
                  className="pl-3 pr-7 py-1.5 rounded-lg text-xs font-semibold appearance-none focus:outline-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--txt)' }}>
                  <option value="expected_return_percent">Return %</option>
                  <option value="confidence">Confidence</option>
                  <option value="investment">Invested</option>
                  <option value="future_value">Future Value</option>
                </select>
                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--txt3)' }} />
              </div>

              {/* Asc/desc */}
              <button onClick={() => setSortAsc(p => !p)}
                className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--txt2)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--teal-border)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                {sortAsc ? <SortAsc size={13} /> : <SortDesc size={13} />}
              </button>

              {/* Cards / Table toggle */}
              <div className="flex items-center gap-0.5 p-0.5 rounded-lg"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                {([
                  { m: 'cards' as ViewMode, icon: <LayoutGrid size={13} />, label: 'Cards' },
                  { m: 'table' as ViewMode, icon: <Table2 size={13} />,    label: 'Table' },
                ]).map(v => (
                  <button key={v.m} onClick={() => setView(v.m)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all"
                    style={{ background: view === v.m ? 'var(--teal)' : 'transparent', color: view === v.m ? '#080D16' : 'var(--txt3)' }}>
                    {v.icon}<span className="hidden sm:inline">{v.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards view */}
          {view === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sorted.map((stock, i) => (
                <div key={stock.symbol} className="fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                  <StockCard stock={stock} rank={i + 1} isTop={stock.symbol === topSymbol} market={mkt} total={lastInput!.amount} />
                </div>
              ))}
            </div>
          )}

          {/* Table view */}
          {view === 'table' && (
            <StockTable stocks={sorted} sortBy={sortBy} sortAsc={sortAsc} onSort={handleSort} market={mkt} total={lastInput!.amount} topSymbol={topSymbol} />
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-3 p-4 rounded-2xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--yellow)' }} />
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--txt3)' }}>
              <span className="font-bold" style={{ color: 'var(--yellow)' }}>Disclaimer: </span>
              These AI recommendations are for informational purposes only and do not constitute financial advice.
              Always consult a SEBI-registered advisor before investing. Market investments are subject to risk.
            </p>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!data && !loading && !error && (
        <div className="text-center py-16 fade-up">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--teal-dim)', border: '1px solid var(--teal-border)' }}>
            <Brain size={26} style={{ color: 'var(--teal)' }} />
          </div>
          <p className="text-sm font-bold mb-2" style={{ color: 'var(--txt)' }}>Configure your portfolio above</p>
          <p className="text-xs" style={{ color: 'var(--txt3)' }}>
            Set your investment amount, duration, and market then click{' '}
            <span style={{ color: 'var(--teal)' }}>"Generate AI Recommendations"</span>
          </p>
        </div>
      )}
    </div>
  );
}
