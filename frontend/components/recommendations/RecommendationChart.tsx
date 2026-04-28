'use client';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import type { StockRecommendation, Market } from '@/types/recommendations';
import { BarChart2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface Props { stocks: StockRecommendation[]; market: Market }

function fmtY(v: number, market: Market) {
  const s = market === 'india' ? '₹' : '$';
  if (v >= 1_00_000) return `${s}${(v / 1_00_000).toFixed(0)}L`;
  if (v >= 1_000)    return `${s}${(v / 1_000).toFixed(0)}K`;
  return `${s}${v}`;
}

export default function RecommendationChart({ stocks, market }: Props) {
  const { theme } = useTheme();
  const axisColor = theme === 'dark' ? '#3D4F6B' : '#CBD5E1';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
  const sym = market === 'india' ? '₹' : '$';

  const data = stocks.map(s => ({
    name:          s.symbol.replace('.NS', ''),
    'Invested':    s.investment,
    'Future Value':s.future_value,
    isProfit:      s.expected_return_percent >= 0,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="card p-3 text-xs space-y-1 min-w-[150px]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="font-bold mb-1.5" style={{ color: 'var(--txt)' }}>{label}</p>
        {payload.map((p: { name: string; value: number; color: string }) => (
          <div key={p.name} className="flex justify-between gap-4">
            <span style={{ color: 'var(--txt3)' }}>{p.name}</span>
            <span className="font-mono font-semibold" style={{ color: p.color }}>
              {sym}{p.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart2 size={14} style={{ color: 'var(--teal)' }} />
        <span className="text-sm font-bold" style={{ color: 'var(--txt)' }}>Invested vs Future Value</span>
        <span className="text-[10px] ml-auto" style={{ color: 'var(--txt3)' }}>Per stock comparison</span>
      </div>
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={3}>
            <CartesianGrid stroke={gridColor} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={v => fmtY(v, market)} tick={{ fontSize: 10, fill: axisColor, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} width={50} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
              formatter={(v: string) => <span style={{ color: 'var(--txt2)' }}>{v}</span>} />
            <Bar dataKey="Invested" radius={[4,4,0,0]} maxBarSize={28}>
              {data.map((_, i) => <Cell key={i} fill="rgba(0,212,200,0.2)" stroke="var(--teal)" strokeWidth={1} />)}
            </Bar>
            <Bar dataKey="Future Value" radius={[4,4,0,0]} maxBarSize={28}>
              {data.map((d, i) => (
                <Cell key={i}
                  fill={d.isProfit ? 'rgba(0,212,200,0.75)' : 'rgba(255,69,96,0.75)'}
                  stroke={d.isProfit ? 'var(--teal)' : 'var(--red)'} strokeWidth={1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
