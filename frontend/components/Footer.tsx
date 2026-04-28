"use client";
import React, { useState } from "react";
import {
  TrendingUp,
  MapPin,
  Zap,
  Bot,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  Mail,
  ArrowRight,
  BarChart2,
  Brain,
  Activity,
  Shield,
  BookOpen,
  Newspaper,
  HelpCircle,
  FileText,
  Users,
  Briefcase,
  MessageCircle,
  ChevronRight,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import clsx from "clsx";

const QUICK_LINKS = [
  { label: "Home", href: "#" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Watchlist", href: "#" },
  { label: "Market Trends", href: "#" },
  { label: "AI Predictions", href: "#" },
  { label: "Portfolio Tracker", href: "#" },
  { label: "News & Insights", href: "#" },
];

const FEATURES = [
  { icon: <Activity size={11} />, label: "Real-time Stock Data" },
  { icon: <Brain size={11} />, label: "AI Price Prediction" },
  {
    icon: <Newspaper size={11} />,
    label: "Sentiment Analysis (News + Social)",
  },
  {
    icon: <BarChart2 size={11} />,
    label: "Technical Indicators (RSI, MACD, EMA)",
  },
  { icon: <TrendingUp size={11} />, label: "Historical Data Visualization" },
  { icon: <Shield size={11} />, label: "Risk Analysis Engine" },
];

const TOOLS = [
  { icon: <ExternalLink size={11} />, label: "API Access", href: "#" },
  { icon: <FileText size={11} />, label: "Developer Docs", href: "#" },
  { icon: <BookOpen size={11} />, label: "Data Sources", href: "#" },
  { icon: <HelpCircle size={11} />, label: "Financial Glossary", href: "#" },
  { icon: <MessageCircle size={11} />, label: "Help Center", href: "#" },
];

const COMPANY = [
  { icon: <Users size={11} />, label: "About Us", href: "#" },
  { icon: <Briefcase size={11} />, label: "Careers", href: "#" },
  { icon: <Newspaper size={11} />, label: "Blog", href: "#" },
  { icon: <MessageCircle size={11} />, label: "Contact", href: "#" },
  { icon: <Shield size={11} />, label: "Privacy Policy", href: "#" },
  { icon: <FileText size={11} />, label: "Terms of Service", href: "#" },
];

const SOCIALS = [
  { icon: <Twitter size={14} />, label: "Twitter / X", href: "#" },
  { icon: <Linkedin size={14} />, label: "LinkedIn", href: "#" },
  { icon: <Github size={14} />, label: "GitHub", href: "#" },
  { icon: <Youtube size={14} />, label: "YouTube", href: "#" },
];

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4
      className="text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
      style={{ color: "var(--teal)" }}
    >
      <span
        className="w-3 h-px inline-block"
        style={{ background: "var(--teal)" }}
      />
      {children}
    </h4>
  );
}

function FLink({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 py-0.5 text-[11px] group transition-colors"
      style={{ color: "var(--txt2)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--teal)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--txt2)")}
    >
      {icon && <span style={{ color: "var(--txt3)" }}>{icon}</span>}
      <span>{children}</span>
      <ChevronRight
        size={9}
        className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
      />
    </a>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSubscribed(true);
  };

  return (
    <footer
      className="mt-0 border-t"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Accent bar */}
      <div
        className="h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--teal), transparent)",
          opacity: 0.35,
        }}
      />

      {/* Main grid */}
      <div className="max-w-screen-xl mx-auto px-5 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-10">
          {/* Brand — spans 2 cols on xl */}
          <div className="sm:col-span-2 xl:col-span-2 space-y-5">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--teal)" }}
              >
                <TrendingUp
                  size={16}
                  className="text-[#080D16]"
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <p
                  className="font-black text-[15px] leading-none"
                  style={{ color: "var(--txt)" }}
                >
                  Gnosis AI
                </p>
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: "var(--txt3)" }}
                >
                  AI-Powered Financial Intelligence Platform
                </p>
              </div>
            </div>

            <p
              className="text-[12px] leading-relaxed max-w-xs"
              style={{ color: "var(--txt2)" }}
            >
              Making smarter financial decisions with real-time data, predictive
              analytics, and AI-driven insights for traders, investors, and
              analysts worldwide.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {[
                {
                  icon: <MapPin size={9} />,
                  text: "Built for traders & investors",
                },
                { icon: <Zap size={9} />, text: "Real-time intelligence" },
                { icon: <Bot size={9} />, text: "AI predictions & sentiment" },
              ].map(({ icon, text }) => (
                <span
                  key={text}
                  className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border"
                  style={{
                    background: "var(--surface2)",
                    color: "var(--txt2)",
                    borderColor: "var(--border)",
                  }}
                >
                  <span style={{ color: "var(--teal)" }}>{icon}</span>
                  {text}
                </span>
              ))}
            </div>

            {/* Socials */}
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--txt3)" }}
              >
                Follow us
              </p>
              <div className="flex items-center gap-2">
                {SOCIALS.map(({ icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    title={label}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all"
                    style={{
                      background: "var(--surface2)",
                      borderColor: "var(--border)",
                      color: "var(--txt3)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "var(--teal-border)";
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--teal)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "var(--border)";
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--txt3)";
                    }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <ColTitle>Quick Links</ColTitle>
            <nav className="space-y-0">
              {QUICK_LINKS.map((l) => (
                <FLink key={l.label} href={l.href}>
                  {l.label}
                </FLink>
              ))}
            </nav>
          </div>

          {/* Features + Tools */}
          <div className="space-y-6">
            <div>
              <ColTitle>Features</ColTitle>
              <div className="space-y-2">
                {FEATURES.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-start gap-2 text-[11px] py-0.5"
                    style={{ color: "var(--txt2)" }}
                  >
                    <span
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: "var(--teal)" }}
                    >
                      {f.icon}
                    </span>
                    <span className="leading-snug">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <ColTitle>Tools & Resources</ColTitle>
              <nav className="space-y-0">
                {TOOLS.map((t) => (
                  <FLink key={t.label} href={t.href} icon={t.icon}>
                    {t.label}
                  </FLink>
                ))}
              </nav>
            </div>
          </div>

          {/* Company + Newsletter */}
          <div className="space-y-6">
            <div>
              <ColTitle>Company</ColTitle>
              <nav className="space-y-0">
                {COMPANY.map((c) => (
                  <FLink key={c.label} href={c.href} icon={c.icon}>
                    {c.label}
                  </FLink>
                ))}
              </nav>
            </div>

            {/* Newsletter CTA */}
            <div
              className="p-4 rounded-xl border space-y-3"
              style={{
                background: "var(--surface2)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{
                    background: "var(--teal-dim)",
                    border: "1px solid var(--teal-border)",
                  }}
                >
                  <Mail size={11} style={{ color: "var(--teal)" }} />
                </div>
                <p
                  className="text-[11px] font-bold"
                  style={{ color: "var(--txt)" }}
                >
                  Stay Ahead of the Market 🚀
                </p>
              </div>
              <p
                className="text-[10px] leading-relaxed"
                style={{ color: "var(--txt3)" }}
              >
                Get AI-powered stock insights directly in your inbox.
              </p>

              {subscribed ? (
                <div
                  className="flex items-center gap-2 text-[11px] rounded-lg px-3 py-2"
                  style={{
                    background: "var(--teal-dim)",
                    border: "1px solid var(--teal-border)",
                    color: "var(--teal)",
                  }}
                >
                  <span>✓</span>
                  <span className="font-semibold">
                    Subscribed successfully!
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-3 py-2 rounded-lg text-[11px] focus:outline-none transition-colors"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--txt)",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--teal)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--border)")
                    }
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95 disabled:opacity-60"
                    style={{ background: "var(--teal)", color: "#080D16" }}
                  >
                    {loading ? (
                      <span
                        className="w-3.5 h-3.5 border-2 border-[#080D16] border-t-transparent rounded-full"
                        style={{ animation: "spin 0.8s linear infinite" }}
                      />
                    ) : (
                      <>
                        <Mail size={11} />
                        Subscribe <ArrowRight size={10} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div
          className="mt-10 p-4 rounded-xl border"
          style={{
            background: "var(--surface2)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <AlertTriangle size={12} style={{ color: "var(--yellow)" }} />
            </div>
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: "var(--yellow)" }}
              >
                ⚠ Financial Disclaimer
              </p>
              <p
                className="text-[11px] leading-relaxed"
                style={{ color: "var(--txt3)" }}
              >
                Gnosis AI provides financial insights for{" "}
                <span
                  className="font-semibold"
                  style={{ color: "var(--txt2)" }}
                >
                  informational purposes only
                </span>{" "}
                and does not constitute investment advice. Always conduct your
                own research and consult a qualified financial advisor before
                making any investment decisions.
                <span
                  className="font-semibold"
                  style={{ color: "var(--txt2)" }}
                >
                  {" "}
                  Market investments are subject to risk.
                </span>{" "}
                Past performance is not indicative of future results. Gnosis AI
                and its contributors are not liable for any financial loss
                incurred.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-screen-xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px]" style={{ color: "var(--txt3)" }}>
            © 2026 Gnosis AI. All rights reserved. Developed by Niraj,
            Siddharth, Anupama, and Nimesh.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (l) => (
                <a
                  key={l}
                  href="#"
                  className="text-[11px] transition-colors"
                  style={{ color: "var(--txt3)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--teal)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--txt3)")
                  }
                >
                  {l}
                </a>
              ),
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "var(--teal)",
                animation: "pulse 2s infinite",
              }}
            />
            <span className="text-[11px]" style={{ color: "var(--txt3)" }}>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
