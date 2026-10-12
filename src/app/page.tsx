"use client";

import React, { useState } from "react";
import { DOCUMENT_HEADER } from "@/data/questions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WritingSection } from "@/components/sections/WritingSection";
import { SpeakingSection } from "@/components/sections/SpeakingSection";
import { GrammarSection } from "@/components/sections/GrammarSection";
import { SignsSection } from "@/components/sections/SignsSection";
import { ReadingComprehensionSection } from "@/components/sections/ReadingComprehensionSection";
import { ListeningSection } from "@/components/sections/ListeningSection";

type SectionTab =
  | "all"
  | "writing"
  | "speaking"
  | "grammar"
  | "signs"
  | "reading"
  | "listening";

const SECTION_NAV: {
  id: SectionTab;
  num: string;
  label: string;
  sublabel: string;
  count: string;
  dotClass: string;
  activeClass: string;
  badgeClass: string;
}[] = [
  {
    id: "writing",
    num: "01",
    label: "Writing",
    sublabel: "Sentence Transformation",
    count: "10",
    dotClass: "bg-[#b84a27] dark:bg-[#e07a5f]",
    activeClass:
      "border-[#b84a27] bg-[#b84a27] text-white shadow-sm dark:border-[#e07a5f] dark:bg-[#c85632] dark:text-white",
    badgeClass:
      "border border-[#e2bfb0] bg-[#faece6] text-[#8f3416] dark:border-[#6e3422] dark:bg-[#331911] dark:text-[#f3a68c]",
  },
  {
    id: "speaking",
    num: "02",
    label: "Speaking",
    sublabel: "Sample Topics & Recall",
    count: "3",
    dotClass: "bg-[#6e3556] dark:bg-[#d48ab8]",
    activeClass:
      "border-[#6e3556] bg-[#6e3556] text-white shadow-sm dark:border-[#d48ab8] dark:bg-[#824066] dark:text-white",
    badgeClass:
      "border border-[#d9bdd0] bg-[#f6ebf2] text-[#662b50] dark:border-[#5c2c4a] dark:bg-[#2b1423] dark:text-[#e6a5ce]",
  },
  {
    id: "grammar",
    num: "03",
    label: "Grammar",
    sublabel: "Multiple Choice & Mixed",
    count: "23",
    dotClass: "bg-[#25416b] dark:bg-[#7ca5de]",
    activeClass:
      "border-[#25416b] bg-[#25416b] text-white shadow-sm dark:border-[#7ca5de] dark:bg-[#31558a] dark:text-white",
    badgeClass:
      "border border-[#bccce3] bg-[#eaeff7] text-[#1d3961] dark:border-[#2c4469] dark:bg-[#132033] dark:text-[#98bae8]",
  },
  {
    id: "signs",
    num: "04",
    label: "Signs & Notices",
    sublabel: "Visual Interpretation",
    count: "10",
    dotClass: "bg-[#b47b28] dark:bg-[#e0a96d]",
    activeClass:
      "border-[#9e6919] bg-[#a36c1d] text-white shadow-sm dark:border-[#e0a96d] dark:bg-[#b57922] dark:text-white",
    badgeClass:
      "border border-[#e3cc9e] bg-[#fbf2df] text-[#7c5110] dark:border-[#664919] dark:bg-[#2e210b] dark:text-[#f0c775]",
  },
  {
    id: "reading",
    num: "05",
    label: "Reading",
    sublabel: "Passages & Cloze Test",
    count: "20",
    dotClass: "bg-[#1f5c44] dark:bg-[#52b788]",
    activeClass:
      "border-[#1f5c44] bg-[#1f5c44] text-white shadow-sm dark:border-[#52b788] dark:bg-[#287255] dark:text-white",
    badgeClass:
      "border border-[#b7d3c4] bg-[#e6f2ec] text-[#184e38] dark:border-[#285440] dark:bg-[#12291f] dark:text-[#86d9b3]",
  },
  {
    id: "listening",
    num: "06",
    label: "Listening",
    sublabel: "True/False & Gap-Fills",
    count: "50",
    dotClass: "bg-[#9e3337] dark:bg-[#e57373]",
    activeClass:
      "border-[#9e3337] bg-[#9e3337] text-white shadow-sm dark:border-[#e57373] dark:bg-[#b03c40] dark:text-white",
    badgeClass:
      "border border-[#e3bfc0] bg-[#faebeb] text-[#8c262b] dark:border-[#662629] dark:bg-[#301214] dark:text-[#f29d9f]",
  },
  {
    id: "all",
    num: "ALL",
    label: "Full Workbook",
    sublabel: "All 6 Sections Combined",
    count: "116",
    dotClass: "bg-stone-700 dark:bg-stone-300",
    activeClass:
      "border-stone-900 bg-stone-900 text-stone-50 shadow-sm dark:border-stone-200 dark:bg-stone-100 dark:text-stone-950",
    badgeClass:
      "border border-stone-300 bg-stone-200/70 text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200",
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<SectionTab>("writing");
  const [globalReviewMode, setGlobalReviewMode] = useState<boolean>(false);

  return (
    <div className="min-h-screen">
      {/* Editorial Top Masthead */}
      <header className="studio-header border-b backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Top Utility Bar: Edition Tag + Theme/Style Controls */}
          <div className="flex flex-col justify-between gap-4 border-b border-stone-300/60 pb-5 lg:flex-row lg:items-center dark:border-stone-800/80">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d9c7b2] bg-[#f4eadc] px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-[#7d3b1e] dark:border-[#47382c] dark:bg-[#261e18] dark:text-[#e89978]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#b84a27] dark:bg-[#e07a5f]" />
                Active Recall Atelier
              </span>
              <span className="hidden font-mono text-xs text-stone-500 sm:inline dark:text-stone-400">
                116 Curated Items • 6 Modules
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setGlobalReviewMode((prev) => !prev)}
                className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                  globalReviewMode
                    ? "border-[#b84a27] bg-[#b84a27] text-white shadow-xs dark:border-[#e07a5f] dark:bg-[#c85632] dark:text-white"
                    : "studio-card text-stone-700 hover:border-stone-400 dark:text-stone-200 dark:hover:border-stone-600"
                }`}
              >
                {globalReviewMode ? "Flashcard Deck: ON" : "Flashcard Deck: OFF"}
              </button>
            </div>
          </div>

          {/* Editorial Title Block */}
          <div className="mt-6 space-y-2">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-100">
              {DOCUMENT_HEADER.title}
            </h1>
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#943719] dark:text-[#e89978]">
              {DOCUMENT_HEADER.subtitle}
            </p>
            <p className="max-w-3xl text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              {DOCUMENT_HEADER.description}
            </p>
          </div>

          {/* Architectural Section Bento Grid */}
          <nav
            aria-label="Sections"
            className="mt-7 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {SECTION_NAV.map((item) => {
              const isCurrent = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`group flex items-center justify-between rounded-xl border px-3.5 py-3 text-left transition-all ${
                    isCurrent
                      ? item.activeClass
                      : "studio-card hover:border-stone-400 dark:hover:border-stone-600"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          isCurrent ? "bg-current opacity-90" : item.dotClass
                        }`}
                      />
                      <span
                        className={`font-mono text-[10px] font-semibold uppercase tracking-wider ${
                          isCurrent
                            ? "opacity-80"
                            : "text-stone-500 dark:text-stone-400"
                        }`}
                      >
                        Sec {item.num}
                      </span>
                    </div>
                    <div
                      className={`mt-0.5 truncate text-xs font-semibold ${
                        isCurrent
                          ? ""
                          : "text-stone-900 dark:text-stone-100"
                      }`}
                    >
                      {item.label}
                    </div>
                    <div
                      className={`truncate text-[11px] ${
                        isCurrent
                          ? "opacity-85"
                          : "text-stone-500 dark:text-stone-400"
                      }`}
                    >
                      {item.sublabel}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-lg px-2 py-0.5 font-mono text-[11px] font-semibold ${
                      isCurrent
                        ? "bg-black/15 text-current dark:bg-white/20"
                        : item.badgeClass
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        {(activeTab === "writing" || activeTab === "all") && (
          <WritingSection globalReviewMode={globalReviewMode} />
        )}

        {(activeTab === "speaking" || activeTab === "all") && (
          <SpeakingSection globalReviewMode={globalReviewMode} />
        )}

        {(activeTab === "grammar" || activeTab === "all") && (
          <GrammarSection globalReviewMode={globalReviewMode} />
        )}

        {(activeTab === "signs" || activeTab === "all") && (
          <SignsSection globalReviewMode={globalReviewMode} />
        )}

        {(activeTab === "reading" || activeTab === "all") && (
          <ReadingComprehensionSection globalReviewMode={globalReviewMode} />
        )}

        {(activeTab === "listening" || activeTab === "all") && (
          <ListeningSection globalReviewMode={globalReviewMode} />
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="studio-header mt-16 border-t">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-2 px-4 py-6 text-xs text-stone-500 sm:flex-row sm:items-center sm:px-6 lg:px-8 dark:text-stone-400">
          <span className="font-mono text-[11px]">
            SOURCE: CONTENT.MD • 6 SECTIONS • 116 ACTIVE RECALL ITEMS
          </span>
          <span>
            Multiple Choice • True/False • Fill Blank • Type Answer • Flashcard
            • Matching • Reorder Words • Error Spotting
          </span>
        </div>
      </footer>
    </div>
  );
}
