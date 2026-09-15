"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import rawData from "@/data/qna_data.json";
import {
  Search,
  X,
  Zap,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sun,
  Moon,
  Users,
  BookOpen,
  ArrowDown,
  ArrowUp,
  Sparkles,
} from "lucide-react";

interface QnAItem {
  id: number;
  sheet: string;
  category: string;
  pic: string;
  code: string;
  question: string;
  answer: string;
  badge_color?: {
    bg: string;
    border: string;
    text: string;
  };
}

const CATEGORIES = [
  { id: "all", name: "Semua", count: 200, color: "border-blue-500 text-blue-400 bg-blue-500/10" },
  { id: "Dapel", name: "Dasar Penelitian", count: 31, color: "border-indigo-500 text-indigo-400 bg-indigo-500/10" },
  { id: "Hapel", name: "Hasil Penelitian", count: 64, color: "border-emerald-500 text-emerald-400 bg-emerald-500/10" },
  { id: "Metopel", name: "Metode Penelitian", count: 77, color: "border-amber-500 text-amber-400 bg-amber-500/10" },
  { id: "Lupel", name: "Luaran Penelitian", count: 28, color: "border-pink-500 text-pink-400 bg-pink-500/10" },
];

const QUICK_TAGS = [
  "urgensi",
  "novelty",
  "CAIDS-20",
  "IPIP-BFM-50",
  "Spearman",
  "t-test",
  "purposive sampling",
  "luaran wajib",
  "Hak Cipta",
  "DiRI",
];

const CATEGORY_TAG_STYLES: Record<string, string> = {
  Dapel: "bg-indigo-500/15 border-indigo-500/40 text-indigo-300",
  Hapel: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
  Metopel: "bg-amber-500/15 border-amber-500/40 text-amber-300",
  Lupel: "bg-pink-500/15 border-pink-500/40 text-pink-300",
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize Theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pimnas_theme") as "dark" | "light" | null;
    const active = saved || "dark";
    setTheme(active);
    document.documentElement.setAttribute("data-theme", active);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("pimnas_theme", next);
  };

  // Instant Search Engine (< 2 ms)
  const { results, elapsed } = useMemo(() => {
    const t0 = performance.now();
    const cleanQuery = query.trim().toLowerCase();
    const queryWords = cleanQuery.split(/\s+/).filter((w) => w.length > 0);

    const items = (rawData as QnAItem[]).filter((item) => {
      if (activeCategory !== "all" && item.sheet !== activeCategory) {
        return false;
      }
      return true;
    });

    if (!cleanQuery) {
      const t1 = performance.now();
      return { results: items, elapsed: (t1 - t0).toFixed(2) };
    }

    const scored: { score: number; item: QnAItem }[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const qLower = item.question.toLowerCase();
      const aLower = item.answer.toLowerCase();
      const catLower = item.category.toLowerCase();
      const picLower = item.pic.toLowerCase();

      let score = 0;

      // 1. Exact phrase match in Question (Top Weight)
      if (qLower.includes(cleanQuery)) {
        score += 200;
        if (qLower.startsWith(cleanQuery)) score += 80;
      }

      // 2. Exact phrase in Answer
      if (aLower.includes(cleanQuery)) {
        score += 70;
      }

      // 3. Word-by-word matching
      let allWordsInQ = true;
      let allWordsInItem = true;

      for (let j = 0; j < queryWords.length; j++) {
        const w = queryWords[j];
        if (qLower.includes(` ${w} `) || qLower.startsWith(`${w} `) || qLower.endsWith(` ${w}`)) {
          score += 45;
        } else if (qLower.includes(w)) {
          score += 30;
        } else {
          allWordsInQ = false;
        }

        if (aLower.includes(` ${w} `) || aLower.startsWith(`${w} `) || aLower.endsWith(` ${w}`)) {
          score += 20;
        } else if (aLower.includes(w)) {
          score += 15;
        } else {
          allWordsInItem = false;
        }

        if (catLower.includes(w) || item.code.toLowerCase().includes(w) || picLower.includes(w)) {
          score += 10;
        }
      }

      if (allWordsInQ) score += 60;
      else if (allWordsInItem) score += 25;

      if (score > 0) {
        scored.push({ score, item });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    const t1 = performance.now();

    return {
      results: scored.map((s) => s.item),
      elapsed: (t1 - t0).toFixed(2),
    };
  }, [query, activeCategory]);

  useEffect(() => {
    setSearchTime(parseFloat(elapsed));
    setSelectedIndex(0);
  }, [results, elapsed]);

  const activeItem: QnAItem | undefined = results[selectedIndex] || results[0];

  // Highlight keywords
  const highlightWords = useMemo(() => {
    return query
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 0);
  }, [query]);

  const renderHighlighted = (text: string) => {
    if (!text || highlightWords.length === 0) return text;
    const escaped = highlightWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const regex = new RegExp(`(${escaped.join("|")})`, "gi");

    const parts = text.split(regex);
    return parts.map((part, i) => {
      const isMatch = highlightWords.some((w) => w.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return (
          <mark key={i} className="keyword-match">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!activeItem) return;
    const copyText = `[${activeItem.code} - ${activeItem.category}]\nQ: ${activeItem.question}\n\nA: ${activeItem.answer}`;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Text to Speech
  const toggleSpeech = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Browser ini belum mendukung fitur Text-to-Speech.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!activeItem) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeItem.answer);
    utterance.lang = "id-ID";
    utterance.rate = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSpeaking, activeItem]);

  // Stop speaking on item change
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [selectedIndex, activeCategory]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (e.key === "Escape") {
        if (query) {
          setQuery("");
        } else {
          searchInputRef.current?.blur();
        }
        return;
      }

      if (e.key === "ArrowDown") {
        if (results.length > 0) {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.min(results.length, 30));
        }
      } else if (e.key === "ArrowUp") {
        if (results.length > 0) {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + Math.min(results.length, 30)) % Math.min(results.length, 30));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [query, results]);

  return (
    <div className="relative min-h-screen">
      {/* Ambient background glows */}
      <div className="glow-sphere glow-1" aria-hidden="true" />
      <div className="glow-sphere glow-2" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col min-h-screen gap-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              PIMNAS MBPP 2026 Online
            </div>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-400 bg-clip-text text-transparent">
              Sistem Pencarian Instan Q&amp;A
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Ketik kata kunci pertanyaan apa saja, jawaban langsung tersaji seketika (&lt; 10 ms).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
              <BookOpen className="h-4 w-4 text-emerald-400" />
              <span className="font-mono font-bold text-emerald-400">200</span>
              <span className="text-xs text-slate-400">Database Q&amp;A</span>
            </div>

            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-blue-500/50 backdrop-blur-md transition-all"
              title="Ganti Tema (Dark / Light)"
              aria-label="Ganti Tema"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Search & Filter Bar */}
        <section className="flex flex-col gap-4">
          {/* Big Search Input */}
          <div className="group relative flex items-center rounded-2xl border-2 border-white/10 bg-slate-900/70 px-4 py-2.5 shadow-2xl backdrop-blur-xl focus-within:border-blue-500 focus-within:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all">
            <Search className="mr-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik kata kunci pertanyaan... (misal: urgensi, CAIDS, novelty, spearman, sampel)"
              className="w-full bg-transparent text-base sm:text-lg font-medium outline-none placeholder:text-slate-500 text-white"
              autoFocus
              spellCheck={false}
            />

            <div className="flex items-center gap-2">
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Hapus pencarian (Esc)"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block rounded border border-white/15 bg-white/5 px-2 py-0.5 text-xs font-mono text-slate-400">
                /
              </kbd>
            </div>
          </div>

          {/* Search Meta & Response Time */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-400 px-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono font-semibold text-emerald-400">
                <Zap className="h-3.5 w-3.5" />
                {searchTime} ms
                <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                  (Target: &lt; 1000 ms)
                </span>
              </span>
              <span>
                Ditemukan <strong className="text-white">{results.length}</strong> pertanyaan
              </span>
            </div>

            <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
              <span>
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">↑</kbd>
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] ml-1">↓</kbd> Pilih
              </span>
              <span>
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> Reset
              </span>
            </div>
          </div>

          {/* Quick Keyword Pills */}
          <div className="flex flex-wrap items-center gap-1.5 px-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Sparkles className="h-3 w-3 text-amber-400" /> Kata Kunci:
            </span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setQuery(tag);
                  searchInputRef.current?.focus();
                }}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-slate-300 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-300 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat.name}
                  <span
                    className={`rounded-full px-1.5 py-0.2 font-mono text-[11px] ${
                      isActive ? "bg-white/20 text-white" : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Main Content Layout */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Spotlight Answer Card (Cols 7 on Desktop) */}
          <section className="lg:col-span-7 sticky top-4">
            {activeItem ? (
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-7 shadow-2xl backdrop-blur-xl flex flex-col gap-5">
                {/* Gradient Top Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500" />

                {/* Card Header & Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        CATEGORY_TAG_STYLES[activeItem.sheet] || "bg-blue-500/10 border-blue-500 text-blue-300"
                      }`}
                    >
                      {activeItem.category}
                    </span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-xs font-bold text-slate-200">
                      {activeItem.code}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-300">
                      <Users className="h-3 w-3 text-slate-400" />
                      {activeItem.pic}
                    </span>
                  </div>

                  {/* Tools: Copy & Speech */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSpeech}
                      className={`inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold transition-all ${
                        isSpeaking
                          ? "border-rose-500/50 bg-rose-500/20 text-rose-300 animate-pulse"
                          : "text-slate-300 hover:border-white/20 hover:bg-white/10"
                      }`}
                      title="Dengarkan Jawaban (Speech)"
                    >
                      {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                      <span>{isSpeaking ? "Berhenti" : "Dengar"}</span>
                    </button>

                    <button
                      onClick={handleCopy}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                        copied
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                          : "border-blue-500/30 bg-blue-500/15 text-blue-300 hover:bg-blue-500 hover:text-white"
                      }`}
                      title="Salin Jawaban Lengkap"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? "Tersalin!" : "Salin Jawaban"}</span>
                    </button>
                  </div>
                </div>

                {/* Question Display */}
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Pertanyaan:
                  </div>
                  <h2 className="mt-1 text-lg sm:text-xl font-bold leading-relaxed text-white">
                    {renderHighlighted(activeItem.question)}
                  </h2>
                </div>

                {/* Answer Display */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5 flex flex-col gap-2 shadow-inner">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold uppercase tracking-widest text-emerald-400">
                      Jawaban Instan:
                    </span>
                    <span className="font-mono text-emerald-400/80 text-[11px]">
                      ✓ Respon dalam {searchTime} ms
                    </span>
                  </div>
                  <p className="text-base sm:text-lg leading-relaxed text-slate-200 whitespace-pre-line font-normal">
                    {renderHighlighted(activeItem.answer)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-12 text-center text-slate-400">
                <Search className="mx-auto h-12 w-12 text-slate-600 mb-3" />
                <h3 className="text-lg font-bold text-white">Tidak ada hasil yang cocok</h3>
                <p className="mt-1 text-sm">
                  Tidak ditemukan pertanyaan atau jawaban dengan kata kunci &quot;{query}&quot;. Coba gunakan kata kunci
                  lain.
                </p>
              </div>
            )}
          </section>

          {/* Related Matches List (Cols 5 on Desktop) */}
          <aside className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Daftar Pertanyaan Cocok
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-mono text-slate-300">
                  {results.length} item
                </span>
              </h3>
              <span className="text-xs text-slate-400 hidden sm:inline">Klik untuk spotlight</span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[75vh] overflow-y-auto pr-1">
              {results.slice(0, 35).map((item, index) => {
                const isSelected = item.id === activeItem?.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedIndex(index)}
                    className={`flex flex-col gap-1.5 rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                        : "border-white/10 bg-slate-900/50 hover:border-white/25 hover:bg-slate-900/90"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[11px]">
                      <span
                        className={`rounded px-1.5 py-0.5 font-bold uppercase ${
                          CATEGORY_TAG_STYLES[item.sheet] || "bg-blue-500/10 text-blue-300"
                        }`}
                      >
                        {item.sheet}
                      </span>
                      <span className="font-mono font-bold text-slate-400">{item.code}</span>
                      <span className="text-slate-400 truncate max-w-[150px]">
                        {item.pic.split(",")[0]}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-slate-200 line-clamp-2 leading-snug">
                      {renderHighlighted(item.question)}
                    </div>

                    <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.answer}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-white/10 pt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-slate-300">/</kbd> Fokus Cari
            </span>
            <span>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-slate-300">Esc</kbd> Hapus
            </span>
            <span>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-slate-300">↓ / ↑</kbd> Pilih
            </span>
          </div>
          <div>PIMNAS MBPP 2026 &bull; Siap Deploy Vercel (Online 24/7)</div>
        </footer>
      </div>
    </div>
  );
}
