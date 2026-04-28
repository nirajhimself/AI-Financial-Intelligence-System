"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: any[];
  loading?: boolean;
}

export default function Chart({ data, loading }: Props) {
  console.log("CHART DATA:", data);

  if (loading) {
    return <div className="text-sm">Loading chart...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-sm">No chart data available</div>;
  }

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          {/* 🔥 IMPORTANT: date key */}
          <XAxis dataKey="date" hide />

          <YAxis />

          <Tooltip />

          {/* 🔥 IMPORTANT: use close */}
          <Line
            type="monotone"
            dataKey="close"
            stroke="#00d4ff"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
