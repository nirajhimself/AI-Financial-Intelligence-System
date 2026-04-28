"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { fetchAllPrices, checkBackendHealth } from "@/services/api";
import type { StockPrice } from "@/types";
import clsx from "clsx";

interface Props {
  active: string;
  onSelect: (s: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ active, onSelect, isOpen, onClose }: Props) {
  // ✅ WATCHLIST STATE (dynamic)
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [prices, setPrices] = useState<Record<string, StockPrice>>({});
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [lastSync, setLastSync] = useState<string>("");

  // ✅ LOAD WATCHLIST FROM STORAGE
  useEffect(() => {
    const saved = localStorage.getItem("watchlist");
    if (saved) {
      setWatchlist(JSON.parse(saved));
    } else {
      const defaultList = ["AAPL", "TSLA", "MSFT"];
      setWatchlist(defaultList);
      localStorage.setItem("watchlist", JSON.stringify(defaultList));
    }
  }, []);

  // ✅ FETCH DATA
  const load = useCallback(async () => {
    const health = await checkBackendHealth();
    setIsLive(health);

    if (watchlist.length === 0) return;

    const data = await fetchAllPrices(watchlist);
    const map: Record<string, StockPrice> = {};
    data.forEach((p) => {
      map[p.symbol] = p;
    });

    setPrices(map);
    setLoading(false);

    const now = new Date();
    setLastSync(
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    );
  }, [watchlist]);

  useEffect(() => {
    load();
    const iv = setInterval(load, 20000);
    return () => clearInterval(iv);
  }, [load]);

  // ✅ ADD STOCK
  const addStock = () => {
    const symbol = prompt("Enter stock symbol (e.g. NVDA)")?.toUpperCase();
    if (!symbol) return;

    if (!watchlist.includes(symbol)) {
      const updated = [...watchlist, symbol];
      setWatchlist(updated);
      localStorage.setItem("watchlist", JSON.stringify(updated));
    }
  };

  // ✅ REMOVE STOCK
  const removeStock = (symbol: string) => {
    const updated = watchlist.filter((s) => s !== symbol);
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-40 w-60 flex flex-col",
          "border-r transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="font-bold text-sm text-[var(--txt)]">Watchlist</p>
          <button onClick={onClose} className="lg:hidden text-[var(--txt3)]">
            <X size={16} />
          </button>
        </div>

        {/* Status */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b text-[10px]"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-1.5">
            {isLive ? (
              <Wifi size={11} style={{ color: "var(--teal)" }} />
            ) : (
              <WifiOff size={11} style={{ color: "var(--red)" }} />
            )}
            <span style={{ color: isLive ? "var(--teal)" : "var(--red)" }}>
              {isLive ? "Live Data" : "Offline"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {lastSync && (
              <span style={{ color: "var(--txt3)" }}>{lastSync}</span>
            )}
            <button onClick={load}>
              <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Add Button */}
        <div className="flex justify-end px-4 py-2">
          <button
            onClick={addStock}
            className="w-6 h-6 rounded-md flex items-center justify-center bg-[var(--surface2)] hover:bg-[var(--teal-dim)] transition"
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Stock List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-3">
          {watchlist.map((sym) => {
            const p = prices[sym];
            const isAct = sym === active;
            const isPos = (p?.change_pct ?? 0) >= 0;

            return (
              <div
                key={sym}
                className={clsx(
                  "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer",
                  isAct ? "bg-[var(--teal-dim)]" : "hover:bg-[var(--surface2)]",
                )}
              >
                <div
                  onClick={() => {
                    onSelect(sym);
                    onClose();
                  }}
                >
                  <p className="text-xs font-semibold">{sym}</p>
                  <p className="text-[10px] text-[var(--txt3)]">
                    {p?.change_pct != null ? `${p.change_pct.toFixed(2)}%` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={
                      isPos
                        ? "text-[var(--teal)] text-[10px]"
                        : "text-[var(--red)] text-[10px]"
                    }
                  >
                    {p?.change_pct != null ? `${p.change_pct.toFixed(2)}%` : ""}
                  </span>

                  <button onClick={() => removeStock(sym)}>
                    <X size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
