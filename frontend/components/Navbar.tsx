"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Sun,
  Moon,
  Bell,
  MessageSquare,
  Menu,
  TrendingUp,
  X,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import clsx from "clsx";

const POPULAR = [
  "AAPL",
  "TSLA",
  "NVDA",
  "MSFT",
  "GOOG",
  "AMZN",
  "META",
  "RVNL.NS",
  "TCS.NS",
  "INFY.NS",
];
const ALL_TICKERS = [
  ...POPULAR,
  "NFLX",
  "AMD",
  "INTC",
  "BABA",
  "JPM",
  "RELIANCE.NS",
  "HDFCBANK.NS",
  "WIPRO.NS",
];

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: (sym: string) => void;
  onChatOpen: () => void;
  onMenuOpen: () => void;
  activeTab: string;
  onTabChange: (t: string) => void;
}

export default function Navbar({
  search,
  onSearchChange,
  onSearchSubmit,
  onChatOpen,
  onMenuOpen,
  activeTab,
  onTabChange,
}: Props) {
  const { theme, toggleTheme } = useTheme();

  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Suggestions logic
  useEffect(() => {
    setSuggestions(
      search.trim()
        ? ALL_TICKERS.filter((s) =>
            s.toLowerCase().includes(search.toLowerCase()),
          ).slice(0, 6)
        : [],
    );
  }, [search]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const submit = (sym?: string) => {
    const t = (sym || search).trim().toUpperCase();
    if (t) {
      onSearchSubmit(t);
      setFocused(false);
    }
  };

  const tabs = [
    { id: "home", label: "Home" },
    { id: "aipicks", label: "AI Picks" },
    { id: "dashboard", label: "Dashboard" },
    { id: "previous", label: "Previous" },
  ];

  return (
    <header className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-20">
      <div className="flex items-center gap-3 px-4 h-14">
        {/* Mobile menu */}
        <button
          onClick={onMenuOpen}
          className="lg:hidden text-[var(--txt2)] hover:text-[var(--txt)]"
        >
          <Menu size={20} />
        </button>

        {/* Logo */}
        <div className="hidden lg:flex items-center gap-2 mr-1 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[var(--teal)] flex items-center justify-center">
            <TrendingUp
              size={13}
              className="text-[#080D16]"
              strokeWidth={2.5}
            />
          </div>
          <span className="font-bold text-sm text-[var(--txt)]">Gnosis</span>
        </div>

        {/* Tabs */}
        <nav className="hidden md:flex items-center gap-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                activeTab === t.id
                  ? "bg-[var(--teal-dim)] text-[var(--teal)]"
                  : "text-[var(--txt2)] hover:text-[var(--txt)] hover:bg-[var(--surface2)]",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Search */}
        <div ref={containerRef} className="flex-1 relative max-w-xl mx-auto">
          <div
            className={clsx(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all",
              "bg-[var(--surface2)]",
              focused
                ? "border-[var(--teal)] shadow-[0_0_0_3px_rgba(0,212,200,0.1)]"
                : "border-[var(--border)]",
            )}
          >
            <Search
              size={14}
              className={focused ? "text-[var(--teal)]" : "text-[var(--txt3)]"}
            />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => onSearchChange(e.target.value.toUpperCase())}
              onFocus={() => setFocused(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") setFocused(false);
              }}
              placeholder="Search ticker symbol…"
              className="flex-1 bg-transparent text-sm font-semibold text-[var(--txt)] placeholder:text-[var(--txt3)] focus:outline-none"
            />
            {search && (
              <button
                onClick={() => {
                  onSearchChange("");
                  inputRef.current?.focus();
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Suggestions */}
          {focused && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 card shadow-xl z-50 overflow-hidden">
              {suggestions.length > 0 ? (
                suggestions.map((s) => (
                  <button
                    key={s}
                    onMouseDown={() => {
                      onSearchChange(s);
                      submit(s);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-[var(--surface2)]"
                  >
                    {s}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-[var(--txt3)]">
                  No results
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2" ref={notificationRef}>
          {/* Theme */}
          <button onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* 🔔 Notification */}
          <div className="relative">
            <button onClick={() => setNotificationsOpen((prev) => !prev)}>
              <Bell size={16} />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg p-3">
                <p className="text-xs font-semibold mb-2">Notifications</p>
                <p className="text-xs text-[var(--txt3)]">No new alerts</p>
              </div>
            )}
          </div>

          {/* Chat */}
          <button onClick={onChatOpen}>
            <MessageSquare size={16} />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-lg bg-[var(--teal)] flex items-center justify-center text-xs font-bold">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
