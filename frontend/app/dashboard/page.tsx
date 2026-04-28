"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Layout
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import TickerTape from "@/components/TickerTape";
import ChatPanel from "@/components/ChatPanel";
import Footer from "@/components/Footer";

// Tab views
import HomeView from "@/components/HomeView";
import PreviousView, { saveToHistory } from "@/components/PreviousView";
import AIPicksView from "@/components/AIPicksView";

// Dashboard components
import StockHeader from "@/components/StockHeader";
import StatsCards from "@/components/StatsCards";
import Chart from "@/components/Chart";
import RecommendationPanel from "@/components/RecommendationPanel";

// API + types
import { fetchPrice, fetchHistory, fetchPrediction } from "@/services/api";
import type { StockPrice, HistoryPoint, Prediction } from "@/types";
import { AlertTriangle, X, Clock } from "lucide-react";

const DEFAULT = "AAPL";
const PRICE_INTERVAL_MS = 30_000; // price refreshes every 30s (live)
const PREDICT_TTL_MS = 5 * 60_000; // prediction cached for 5 minutes

type Tab = "home" | "dashboard" | "aipicks" | "previous";

// ── Simple in-memory prediction cache ─────────────────────────────────────────
interface CacheEntry {
  prediction: Prediction;
  fetchedAt: number;
}
const predictionCache = new Map<string, CacheEntry>();

function getCached(symbol: string): Prediction | null {
  const entry = predictionCache.get(symbol);
  if (!entry) return null;
  const age = Date.now() - entry.fetchedAt;
  if (age > PREDICT_TTL_MS) {
    predictionCache.delete(symbol);
    return null;
  }
  return entry.prediction;
}

function setCached(symbol: string, prediction: Prediction) {
  predictionCache.set(symbol, { prediction, fetchedAt: Date.now() });
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [symbol, setSymbol] = useState(DEFAULT);
  const [search, setSearch] = useState(DEFAULT);
  const [activeTab, setActiveTab] = useState<Tab>("home");

  // Data
  const [price, setPrice] = useState<StockPrice | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  // Loading — price and prediction are SEPARATE
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [loadingHist, setLoadingHist] = useState(true);
  const [loadingPred, setLoadingPred] = useState(true);

  // When was prediction last fetched (for display)
  const [predFetchedAt, setPredFetchedAt] = useState<Date | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebar] = useState(false);
  const [chatOpen, setChat] = useState(false);

  // Track current symbol in a ref to avoid stale closures in intervals
  const symbolRef = useRef(symbol);
  symbolRef.current = symbol;

  // ── PRICE ONLY — called every 30 seconds ──────────────────────────────────
  const loadPrice = useCallback(async (sym: string) => {
    try {
      const p = await fetchPrice(sym);
      // Only update if symbol hasn't changed while fetching
      if (sym === symbolRef.current) setPrice(p);
    } catch {
      setError("Price fetch failed — showing last known value");
    } finally {
      setLoadingPrice(false);
    }
  }, []);

  // ── PREDICTION + HISTORY — called only on symbol change or manual refresh ──
  const loadPrediction = useCallback(
    async (sym: string, forceRefresh = false) => {
      setLoadingPred(true);
      setLoadingHist(true);

      // Check cache first (skip API call if recent)
      const cached = forceRefresh ? null : getCached(sym);

      if (cached) {
        setPrediction(cached);
        setLoadingPred(false);
      } else {
        try {
          const pr = await fetchPrediction(sym);
          if (sym === symbolRef.current) {
            setPrediction(pr);
            setCached(sym, pr);
            setPredFetchedAt(new Date());
          }
        } catch {
          // Keep old prediction if available, just log
          console.warn("Prediction fetch failed for", sym);
        } finally {
          if (sym === symbolRef.current) setLoadingPred(false);
        }
      }

      // History
      try {
        const h = await fetchHistory(sym);
        if (sym === symbolRef.current) setHistory(h);
      } catch {
        setHistory([]);
      } finally {
        if (sym === symbolRef.current) setLoadingHist(false);
      }
    },
    [],
  );

  // ── FULL LOAD — symbol change or first load ────────────────────────────────
  const loadAll = useCallback(
    async (sym: string, forcePredict = false) => {
      setError(null);
      setLoadingPrice(true);
      await Promise.all([loadPrice(sym), loadPrediction(sym, forcePredict)]);
    },
    [loadPrice, loadPrediction],
  );

  // ── MANUAL REFRESH — always refetches prediction ──────────────────────────
  const handleRefresh = useCallback(() => {
    predictionCache.delete(symbol); // bust cache
    loadAll(symbol, true);
  }, [symbol, loadAll]);

  // ── Auto-refresh PRICE only every 30s, prediction stays stable ────────────
  useEffect(() => {
    if (activeTab !== "dashboard") return;

    // Initial full load when entering dashboard tab
    loadAll(symbol);

    // Only price auto-refreshes
    const priceInterval = setInterval(() => {
      loadPrice(symbolRef.current);
    }, PRICE_INTERVAL_MS);

    return () => clearInterval(priceInterval);
  }, [symbol, activeTab, loadAll, loadPrice]);

  // Save to history when both price and prediction are ready
  useEffect(() => {
    if (price && prediction) {
      saveToHistory({
        symbol,
        price: price.price,
        predicted_price: prediction.predicted_price,
        recommendation: prediction.recommendation,
        risk_score: prediction.risk_score,
        best_model: prediction.best_model,
      });
    }
  }, [symbol, price?.price, prediction?.predicted_price]); // eslint-disable-line

  // ── Symbol change handler ─────────────────────────────────────────────────
  const handleSelect = (sym: string) => {
    const s = sym.trim().toUpperCase();
    if (!s) return;
    setSymbol(s);
    setSearch(s);
    // Reset data immediately
    setPrice(null);
    setHistory([]);
    setPrediction(null);
    setPredFetchedAt(null);
    setActiveTab("dashboard");
  };

  // ── Derived display values ────────────────────────────────────────────────
  const lastAnalysed = predFetchedAt
    ? predFetchedAt.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : undefined;

  const predAge = predFetchedAt
    ? Math.floor((Date.now() - predFetchedAt.getTime()) / 60_000)
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <Sidebar
        active={symbol}
        onSelect={handleSelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebar(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          search={search}
          onSearchChange={setSearch}
          onSearchSubmit={handleSelect}
          onChatOpen={() => setChat(true)}
          onMenuOpen={() => setSidebar(true)}
          activeTab={activeTab}
          onTabChange={(t) => setActiveTab(t as Tab)}
        />
        <TickerTape />

        {/* Error banner */}
        {error && activeTab === "dashboard" && (
          <div
            className="mx-4 mt-3 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs"
            style={{
              background: "rgba(255,69,96,0.08)",
              border: "1px solid rgba(255,69,96,0.2)",
              color: "var(--red)",
            }}
          >
            <AlertTriangle size={13} />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)}>
              <X size={13} />
            </button>
          </div>
        )}

        {/* Prediction age notice — only shows if prediction is older than 1 min */}
        {activeTab === "dashboard" && predAge !== null && predAge >= 1 && (
          <div
            className="mx-4 mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px]"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--txt3)",
            }}
          >
            <Clock size={11} style={{ color: "var(--teal)" }} />
            <span>
              Prediction from{" "}
              <span style={{ color: "var(--txt2)", fontWeight: 600 }}>
                {predAge} min ago
              </span>{" "}
              — price is live.
              <button
                onClick={handleRefresh}
                className="ml-1 font-semibold underline transition-colors"
                style={{ color: "var(--teal)" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Refresh prediction
              </button>
            </span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          {/* HOME */}
          {activeTab === "home" && (
            <>
              <HomeView
                onGetStarted={() => {
                  setActiveTab("dashboard");
                  loadAll(symbol);
                }}
                onAnalyse={handleSelect}
              />
              <Footer />
            </>
          )}

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="p-4 space-y-4">
              <StockHeader
                symbol={symbol}
                recommendation={prediction?.recommendation ?? "HOLD"}
                prediction={prediction}
                lastUpdated={lastAnalysed}
                onRefresh={handleRefresh}
                loading={loadingPrice || loadingPred}
              />

              <StatsCards
                price={price}
                prediction={prediction}
                loading={loadingPrice || loadingPred}
              />

              <div style={{ minHeight: 340 }}>
                <Chart
                  symbol={symbol}
                  data={history}
                  prediction={prediction}
                  loading={loadingHist}
                />
              </div>

              <RecommendationPanel
                prediction={prediction}
                loading={loadingPred}
              />

              <Footer />
            </div>
          )}

          {/* AI PICKS */}
          {activeTab === "aipicks" && (
            <>
              <AIPicksView />
              <Footer />
            </>
          )}

          {/* PREVIOUS */}
          {activeTab === "previous" && (
            <>
              <PreviousView onAnalyse={handleSelect} />
              <Footer />
            </>
          )}
        </main>
      </div>

      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChat(false)}
        symbol={symbol}
      />
    </div>
  );
}
