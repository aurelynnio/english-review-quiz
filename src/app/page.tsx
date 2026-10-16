"use client";

import React, { useState, useEffect } from "react";
import { HskWord, HSK_WORDS } from "@/data/hskWords";
import {
  UserStudyData,
  loadStudyData,
  getWordProgress,
  isWordDueForReview,
} from "@/utils/hskUtils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DictionarySection } from "@/components/hsk/DictionarySection";
import { StudySection } from "@/components/hsk/StudySection";
import { ReviewSection } from "@/components/hsk/ReviewSection";
import { StatsSection } from "@/components/hsk/StatsSection";
import { WordDetailModal } from "@/components/hsk/WordDetailModal";

type MainTab = "dictionary" | "study" | "review" | "stats";

export default function HskApp() {
  const [studyData, setStudyData] = useState<UserStudyData>({
    words: {},
    streakDays: 1,
    lastActiveDate: "",
    totalReviewsCompleted: 0,
  });
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<MainTab>("dictionary");
  const [selectedWord, setSelectedWord] = useState<HskWord | null>(null);
  const [presetWords, setPresetWords] = useState<HskWord[] | null>(null);

  // Initialize data on client mount
  useEffect(() => {
    setMounted(true);
    const loaded = loadStudyData();
    setStudyData(loaded);
  }, []);

  const handleUpdateStudyData = (nextData: UserStudyData) => {
    setStudyData(nextData);
  };

  // Launch direct practice session from another tab
  const handleLaunchPractice = (words: HskWord[]) => {
    setPresetWords(words);
    setActiveTab("study");
  };

  // Counts for badge indicators
  const dueCount = mounted
    ? HSK_WORDS.filter((w) => isWordDueForReview(getWordProgress(studyData, w.id))).length
    : 0;

  const masteredCount = mounted
    ? HSK_WORDS.filter((w) => getWordProgress(studyData, w.id).status === "mastered").length
    : 0;

  const mistakesCount = mounted
    ? HSK_WORDS.filter((w) => getWordProgress(studyData, w.id).mistakeCount > 0).length
    : 0;

  return (
    <div className="studio-shell min-h-screen">
      {/* Top Main Navigation Header */}
      <header className="studio-header sticky top-0 z-40 border-b backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#b84a27] font-serif text-xl font-extrabold text-white shadow-xs dark:bg-[#d46543]">
              华
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-xl">
                  HSK 3.0 词汇宝典
                </h1>
                <span className="hidden rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-2xs font-bold text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 sm:inline-block">
                  Cấp 1 — 3 • 1000 Từ
                </span>
              </div>
              <p className="text-2xs text-stone-500 dark:text-stone-400">
                Tra từ điển • Học Flashcard & Trắc nghiệm • Ôn tập Spaced Repetition
              </p>
            </div>
          </div>

          {/* Right Header Stats & Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {mounted && (
              <div className="hidden items-center gap-2 rounded-xl border border-stone-200/80 bg-white/60 px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300 md:flex">
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Đã thuộc {masteredCount} / 1000
                </span>
                <span className="text-stone-300 dark:text-stone-700">|</span>
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  🔥 {studyData.streakDays || 1} ngày
                </span>
              </div>
            )}

            <ThemeToggle />
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="border-t border-stone-200/60 dark:border-stone-800/80">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6">
            {/* Tab 1: Dictionary / 查词 */}
            <button
              type="button"
              onClick={() => setActiveTab("dictionary")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 ${
                activeTab === "dictionary"
                  ? "border border-[#b84a27] bg-[#b84a27] text-white shadow-2xs dark:border-[#e06d48] dark:bg-[#d46543] dark:text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>查词 • Tra từ điển (1000)</span>
            </button>

            {/* Tab 2: Study / 背单词 */}
            <button
              type="button"
              onClick={() => setActiveTab("study")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 ${
                activeTab === "study"
                  ? "border border-[#b84a27] bg-[#b84a27] text-white shadow-2xs dark:border-[#e06d48] dark:bg-[#d46543] dark:text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>背单词 • Học Flashcard & Quiz</span>
            </button>

            {/* Tab 3: Review / 复习 */}
            <button
              type="button"
              onClick={() => setActiveTab("review")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 ${
                activeTab === "review"
                  ? "border border-[#b84a27] bg-[#b84a27] text-white shadow-2xs dark:border-[#e06d48] dark:bg-[#d46543] dark:text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>复习 • 智能复习 & Sổ lỗi</span>
              {dueCount > 0 && (
                <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-2xs font-extrabold text-white">
                  {dueCount}
                </span>
              )}
              {mistakesCount > 0 && dueCount === 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.2 text-2xs font-extrabold text-white">
                  {mistakesCount}
                </span>
              )}
            </button>

            {/* Tab 4: Stats / 统计 */}
            <button
              type="button"
              onClick={() => setActiveTab("stats")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 ${
                activeTab === "stats"
                  ? "border border-[#b84a27] bg-[#b84a27] text-white shadow-2xs dark:border-[#e06d48] dark:bg-[#d46543] dark:text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>学习统计 • Thống kê & Sao lưu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === "dictionary" && (
          <DictionarySection
            studyData={studyData}
            onUpdateStudyData={handleUpdateStudyData}
            onSelectWord={(word) => setSelectedWord(word)}
            onPracticeWords={handleLaunchPractice}
          />
        )}

        {activeTab === "study" && (
          <StudySection
            studyData={studyData}
            onUpdateStudyData={handleUpdateStudyData}
            onSelectWord={(word) => setSelectedWord(word)}
            presetWords={presetWords}
            onClearPreset={() => setPresetWords(null)}
          />
        )}

        {activeTab === "review" && (
          <ReviewSection
            studyData={studyData}
            onUpdateStudyData={handleUpdateStudyData}
            onSelectWord={(word) => setSelectedWord(word)}
            onStartReviewSession={handleLaunchPractice}
          />
        )}

        {activeTab === "stats" && (
          <StatsSection
            studyData={studyData}
            onUpdateStudyData={handleUpdateStudyData}
          />
        )}
      </main>

      {/* Word Detail Modal */}
      <WordDetailModal
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
        studyData={studyData}
        onUpdateStudyData={handleUpdateStudyData}
        onStartWordPractice={(word) => handleLaunchPractice([word])}
      />
    </div>
  );
}
