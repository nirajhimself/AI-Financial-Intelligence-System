"use client";
import React from "react";
import { RefreshCw, ExternalLink, Activity, Target } from "lucide-react";
import clsx from "clsx";
import type { Prediction } from "@/types";

const CHIP: Record<string, string> = {
  BUY: "chip-buy",
  SELL: "chip-sell",
  HOLD: "chip-hold",
};

interface Props {
  symbol: string;
  recommendation: string;
  prediction?: Prediction | null; // full prediction for extra fields
  lastUpdated?: string;
  onRefresh: () => void;
  loading: boolean;
}

export default function StockHeader({
  symbol,
  recommendation,
  prediction,
  lastUpdated,
  onRefresh,
  loading,
}: Props) {
  return (
    <div className="card px-5 py-4 fade-up">
      {/* Main row */}
      <div className="flex flex-wrap items-center gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "var(--teal-dim)",
            border: "1px solid var(--teal-border)",
          }}
        >
          <span className="text-sm font-black" style={{ color: "var(--teal)" }}>
            {symbol.replace(".NS", "").replace(".BSE", "").slice(0, 2)}
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-black" style={{ color: "var(--txt)" }}>
              {symbol}
            </h1>
            <span
              className="text-[10px] px-2 py-0.5 rounded-md font-semibold border"
              style={{
                background: "var(--surface2)",
                color: "var(--txt2)",
                borderColor: "var(--border)",
              }}
            >
              NSE
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-md font-semibold border"
              style={{
                background: "var(--surface2)",
                color: "var(--txt2)",
                borderColor: "var(--border)",
              }}
            >
              Equity
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-md font-semibold border"
              style={{
                background: "var(--teal-dim)",
                color: "var(--teal)",
                borderColor: "var(--teal-border)",
              }}
            >
              AI Analysed
            </span>
          </div>
          {lastUpdated && (
            <p className="text-[10px] mt-0.5" style={{ color: "var(--txt3)" }}>
              Last analysed · {lastUpdated}
            </p>
          )}
        </div>

        {/* Right side — signals + controls */}
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {/* Indicator signal badge (new field from backend) */}
          {prediction?.indicator_signal && (
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border"
              style={{
                background: "var(--surface2)",
                borderColor: "var(--border)",
              }}
            >
              <Activity size={11} style={{ color: "var(--txt3)" }} />
              <div className="text-center">
                <p
                  className="text-[9px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--txt3)" }}
                >
                  Tech Signal
                </p>
                <p
                  className={clsx(
                    "text-xs font-black",
                    CHIP[prediction.indicator_signal]?.includes("buy")
                      ? ""
                      : "",
                  )}
                  style={{
                    color:
                      prediction.indicator_signal === "BUY"
                        ? "var(--teal)"
                        : prediction.indicator_signal === "SELL"
                          ? "var(--red)"
                          : "var(--yellow)",
                  }}
                >
                  {prediction.indicator_signal}
                </p>
              </div>
            </div>
          )}

          {/* Accuracy badge (new field from backend) */}
          {prediction?.accuracy != null && (
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border"
              style={{
                background: "var(--surface2)",
                borderColor: "var(--border)",
              }}
            >
              <Target size={11} style={{ color: "var(--txt3)" }} />
              <div className="text-center">
                <p
                  className="text-[9px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--txt3)" }}
                >
                  Accuracy
                </p>
                <p
                  className="text-xs font-black"
                  style={{ color: "var(--teal)" }}
                >
                  {prediction.accuracy.toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {/* Main AI recommendation */}
          <div
            className={clsx(
              "px-5 py-2.5 rounded-xl text-center",
              CHIP[recommendation] ?? CHIP["HOLD"],
            )}
          >
            <p className="text-lg font-black tracking-widest">
              {recommendation || "HOLD"}
            </p>
            <p className="text-[9px] font-semibold tracking-wider opacity-70">
              AI SIGNAL
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all disabled:opacity-40"
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface2)",
              color: "var(--txt3)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--teal)";
              (e.currentTarget as HTMLElement).style.borderColor =
                "var(--teal-border)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--txt3)";
              (e.currentTarget as HTMLElement).style.borderColor =
                "var(--border)";
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all"
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface2)",
              color: "var(--txt3)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--txt)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--txt3)")}
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Extra row — ML vs Rule predictions (new fields from backend) */}
      {prediction &&
        (prediction.ml_prediction || prediction.rule_prediction) && (
          <div
            className="flex flex-wrap gap-3 mt-3 pt-3 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            {[
              {
                label: "ML Prediction",
                value: prediction.ml_prediction,
                color: "var(--teal)",
              },
              {
                label: "Rule Prediction",
                value: prediction.rule_prediction,
                color: "var(--purple)",
              },
              {
                label: "Final Prediction",
                value: prediction.predicted_price,
                color: "var(--txt)",
              },
              {
                label: "Sentiment",
                value: null,
                label2: `${prediction.sentiment_score > 0 ? "+" : ""}${prediction.sentiment_score?.toFixed(1)} · ${prediction.sentiment_label}`,
                color:
                  prediction.sentiment_score >= 0
                    ? "var(--teal)"
                    : "var(--red)",
              },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-1.5">
                <span className="text-[10px]" style={{ color: "var(--txt3)" }}>
                  {m.label}:
                </span>
                <span
                  className="text-[11px] font-bold font-mono"
                  style={{ color: m.color }}
                >
                  {m.value != null ? `$${m.value.toFixed(2)}` : m.label2}
                </span>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
