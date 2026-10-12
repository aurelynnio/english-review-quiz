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
  label: string;
  count: string;
  dotClass: string;
  activeClass: string;
  badgeClass: string;
}[] = [
  {
    id: "writing",
    label: "1. Writing — Sentence Transformation",
    count: "10",
    dotClass: "bg-indigo-500 dark:bg-indigo-400",
    activeClass:
      "border-indigo-600 bg-indigo-600 text-white shadow-xs dark:border-indigo-500 dark:bg-indigo-600 dark:text-white",
    badgeClass:
      "bg-indigo-100/90 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300",
  },
  {
    id: "speaking",
    label: "2. Speaking — Sample Topics",
    count: "3",
    dotClass: "bg-violet-500 dark:bg-violet-400",
    activeClass:
      "border-violet-600 bg-violet-600 text-white shadow-xs dark:border-violet-500 dark:bg-violet-600 dark:text-white",
    badgeClass:
      "bg-violet-100/90 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300",
  },
  {
    id: "grammar",
    label: "3. Grammar — Multiple Choice",
    count: "23",
    dotClass: "bg-sky-500 dark:bg-sky-400",
    activeClass:
      "border-sky-600 bg-sky-600 text-white shadow-xs dark:border-sky-500 dark:bg-sky-600 dark:text-white",
    badgeClass:
      "bg-sky-100/90 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300",
  },
  {
    id: "signs",
    label: "4. Reading — Signs & Notices",
    count: "10",
    dotClass: "bg-amber-500 dark:bg-amber-400",
    activeClass:
      "border-amber-600 bg-amber-600 text-white shadow-xs dark:border-amber-500 dark:bg-amber-600 dark:text-white",
    badgeClass:
      "bg-amber-100/90 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300",
  },
  {
    id: "reading",
    label: "5. Reading Comprehension",
    count: "20",
    dotClass: "bg-teal-500 dark:bg-teal-400",
    activeClass:
      "border-teal-600 bg-teal-600 text-white shadow-xs dark:border-teal-500 dark:bg-teal-600 dark:text-white",
    badgeClass:
      "bg-teal-100/90 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300",
  },
  {
    id: "listening",
    label: "6. Listening Practice",
    count: "50",
    dotClass: "bg-rose-500 dark:bg-rose-400",
    activeClass:
      "border-rose-600 bg-rose-600 text-white shadow-xs dark:border-rose-500 dark:bg-rose-600 dark:text-white",
    badgeClass:
      "bg-rose-100/90 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300",
  },
  {
    id: "all",
    label: "All Sections",
    count: "116",
    dotClass: "bg-cyan-500 dark:bg-cyan-400",
    activeClass:
      "border-cyan-600 bg-cyan-600 text-white shadow-xs dark:border-cyan-500 dark:bg-cyan-600 dark:text-white",
    badgeClass:
      "bg-cyan-100/90 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300",
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<SectionTab>("writing");
  const [globalReviewMode, setGlobalReviewMode] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#f8f8f7] text-neutral-800 dark:bg-[#0e0e10] dark:text-neutral-100">
      {/* Top Header */}
      <header className="border-b border-neutral-200/80 bg-white/95 backdrop-blur-xs dark:border-neutral-800/80 dark:bg-neutral-900/95">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3 py-0.5 text-xs font-semibold tracking-wide text-indigo-700 dark:border-indigo-800/70 dark:bg-indigo-950/60 dark:text-indigo-300">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                English Review System
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
                {DOCUMENT_HEADER.title}
              </h1>
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                {DOCUMENT_HEADER.subtitle}
              </p>
              <p className="max-w-3xl text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                {DOCUMENT_HEADER.description}
              </p>
            </div>

            {/* Global Review Mode (Flashcards) Toggle & Dark Mode Toggle */}
            <div className="flex shrink-0 flex-wrap items-center gap-2.5">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setGlobalReviewMode((prev) => !prev)}
                className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                  globalReviewMode
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-xs dark:border-indigo-500 dark:bg-indigo-600 dark:text-white"
                    : "border-neutral-200/90 bg-white text-neutral-700 shadow-2xs hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40"
                }`}
              >
                {globalReviewMode
                  ? "Review Mode: Flashcards (On)"
                  : "Review Mode: Flashcards (Off)"}
              </button>
            </div>
          </div>

          {/* Section Navigation */}
          <nav
            aria-label="Sections"
            className="mt-7 grid grid-cols-1 gap-2.5 border-t border-neutral-100 pt-6 sm:grid-cols-2 lg:grid-cols-4 dark:border-neutral-800/70"
          >
            {SECTION_NAV.map((item) => {
              const isCurrent = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-between rounded-xl border px-3.5 py-3 text-left text-xs transition-all ${
                    isCurrent
                      ? `${item.activeClass} font-semibold`
                      : "border-neutral-200/80 bg-neutral-50/70 font-medium text-neutral-700 hover:border-neutral-300 hover:bg-white dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:text-neutral-200 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/80"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate pr-2">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        isCurrent ? "bg-white" : item.dotClass
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      isCurrent ? "bg-white/20 text-white" : item.badgeClass
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

      {/* Footer */}
      <footer className="mt-16 border-t border-neutral-200/80 bg-white dark:border-neutral-800/80 dark:bg-neutral-900/80">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-2 px-4 py-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:px-6 lg:px-8 dark:text-neutral-400">
          <span>
            Content source: content.md • 6 Sections • 8 Active Recall Question
            Formats
          </span>
          <span>
            Formats: Multiple Choice • True/False • Fill Blank • Type Answer •
            Flashcard • Matching • Reorder Words • Error Spotting
          </span>
        </div>
      </footer>
    </div>
  );
}
