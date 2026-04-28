"use client";
import React, { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import clsx from "clsx";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
}

export default function ChatPanel({ isOpen, onClose, symbol }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // ✅ Reset chat when symbol changes
  useEffect(() => {
    setMessages([
      {
        id: "init",
        role: "assistant",
        content: `Ask me anything about ${symbol}`,
      },
    ]);
  }, [symbol]);

  // ✅ Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Send message (FULL FIXED)
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      console.log("📤 Sending:", { text, symbol });

      const controller = new AbortController();

      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          symbol,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error("Server error: " + res.status);
      }

      const data = await res.json();

      console.log("📥 Response:", data);

      const botMsg: ChatMessage = {
        id: Date.now().toString() + "_bot",
        role: "assistant",
        content:
          data?.response && data.response.length > 3
            ? data.response
            : "⚠️ AI returned empty response",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("❌ Chat error:", err);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_err",
          role: "assistant",
          content: "⚠️ Cannot connect to backend. Check server.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Enter to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        className={clsx(
          "fixed right-0 top-0 h-full w-80 z-50 flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        style={{ background: "var(--surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <p className="font-semibold text-sm">Gnosis AI Advisor</p>
          <button onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "max-w-[75%] px-3 py-2 rounded-lg text-xs break-words",
                msg.role === "user"
                  ? "ml-auto bg-[var(--teal)] text-black"
                  : "bg-[var(--surface2)] text-[var(--txt)]",
              )}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="text-xs text-[var(--txt3)]">
              🤖 AI is thinking...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-[var(--border)] flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${symbol}...`}
            className="flex-1 px-3 py-2 rounded-lg bg-[var(--surface2)] text-sm outline-none"
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--teal)] disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </>
  );
}
