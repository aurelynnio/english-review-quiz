"use client";

import React, { useState, useMemo } from "react";
import { HskWord, HSK_WORDS } from "@/data/hskWords";
import {
  UserStudyData,
  getWordProgress,
  toggleWordStar,
  setWordStatus,
  playChineseAudio,
  isWordDueForReview,
} from "@/utils/hskUtils";
import { getLevelBadgeClass, getStatusBadgeClass } from "@/utils/themeColors";

interface DictionarySectionProps {
  studyData: UserStudyData;
  onUpdateStudyData: (nextData: UserStudyData) => void;
  onSelectWord: (word: HskWord) => void;
  onPracticeWords?: (words: HskWord[]) => void;
}

export function DictionarySection({
  studyData,
  onUpdateStudyData,
  onSelectWord,
  onPracticeWords,
}: DictionarySectionProps) {
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [posFilter, setPosFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"id" | "pinyin" | "level">("id");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [playingWordId, setPlayingWordId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 48;

  // Distinct POS categories
  const posOptions = useMemo(() => {
    return [
      { id: "all", label: "Tất cả từ loại" },
      { id: "danh từ", label: "Danh từ (Noun)" },
      { id: "động từ", label: "Động từ (Verb)" },
      { id: "tính từ", label: "Tính từ (Adj)" },
      { id: "phó từ", label: "Phó từ (Adverb)" },
      { id: "đại từ", label: "Đại từ (Pronoun)" },
      { id: "lượng từ", label: "Lượng từ (Measure)" },
      { id: "số từ", label: "Số từ (Numeral)" },
      { id: "trợ từ", label: "Trợ từ (Particle)" },
      { id: "liên từ", label: "Liên từ (Conjunction)" },
      { id: "giới từ", label: "Giới từ (Preposition)" },
      { id: "cụm từ", label: "Cụm từ cố định (Phrase)" },
    ];
  }, []);

  // Filtered and sorted words
  const filteredWords = useMemo(() => {
    const rawQ = query.trim().toLowerCase();
    const qWithoutSpace = rawQ.replace(/\s+/g, "");

    return HSK_WORDS.filter((word) => {
      // Level filter
      if (levelFilter !== "all" && word.level !== levelFilter) {
        return false;
      }

      // POS filter
      if (posFilter !== "all") {
        if (!word.pos.toLowerCase().includes(posFilter)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all") {
        const prog = getWordProgress(studyData, word.id);
        if (statusFilter === "starred" && !prog.starred) return false;
        if (statusFilter === "due" && !isWordDueForReview(prog)) return false;
        if (statusFilter === "mastered" && prog.status !== "mastered") return false;
        if (statusFilter === "learning" && prog.status !== "learning") return false;
        if (statusFilter === "unlearned" && prog.status !== "unlearned") return false;
        if (statusFilter === "mistake" && prog.mistakeCount <= 0) return false;
      }

      // Query filter
      if (rawQ) {
        const matchHanzi = word.word.includes(rawQ);
        const matchPinyin =
          word.pinyin.toLowerCase().includes(rawQ) ||
          word.cleanPinyin.includes(qWithoutSpace);
        const matchVi =
          word.meaningVi.toLowerCase().includes(rawQ) ||
          word.cleanMeaningVi.includes(qWithoutSpace);
        const matchHv =
          word.hanviet.toLowerCase().includes(rawQ) ||
          word.cleanHanviet.includes(qWithoutSpace);
        const matchEn = word.meaningEn.toLowerCase().includes(rawQ);

        if (!matchHanzi && !matchPinyin && !matchVi && !matchHv && !matchEn) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "pinyin") {
        return a.cleanPinyin.localeCompare(b.cleanPinyin);
      }
      if (sortBy === "level") {
        if (a.level !== b.level) return a.level - b.level;
        return a.id - b.id;
      }
      return a.id - b.id;
    });
  }, [query, levelFilter, statusFilter, posFilter, sortBy, studyData]);

  // Reset page when filters change
  const paginatedWords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredWords.slice(start, start + PAGE_SIZE);
  }, [filteredWords, currentPage]);

  const totalPages = Math.ceil(filteredWords.length / PAGE_SIZE) || 1;

  const handlePlayAudio = async (e: React.MouseEvent, word: HskWord) => {
    e.stopPropagation();
    setPlayingWordId(word.id);
    await playChineseAudio(word.word);
    setPlayingWordId(null);
  };

  const handleToggleStar = (e: React.MouseEvent, wordId: number) => {
    e.stopPropagation();
    const next = toggleWordStar(studyData, wordId);
    onUpdateStudyData(next);
  };

  const handleCycleStatus = (e: React.MouseEvent, wordId: number) => {
    e.stopPropagation();
    const prog = getWordProgress(studyData, wordId);
    const nextStatus =
      prog.status === "unlearned"
        ? "learning"
        : prog.status === "learning"
        ? "mastered"
        : "unlearned";
    const next = setWordStatus(studyData, wordId, nextStatus);
    onUpdateStudyData(next);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="studio-card rounded-2xl border p-5 shadow-xs">
        {/* Search Bar */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tra cứu từ: 汉字 (爱, 爸爸), Pinyin (nihao, báitiān), Âm Hán-Việt (bạch thiên), Nghĩa tiếng Việt (yêu, bài tập)..."
            className="w-full rounded-xl border border-[#ded3c3] bg-white py-3 pr-10 pl-11 text-sm font-medium text-stone-900 transition-all placeholder:text-stone-400 focus:border-[#b84a27] focus:ring-2 focus:ring-[#b84a27]/20 focus:outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-[#e06d48]"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCurrentPage(1);
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
          <span className="font-medium">Tìm nhanh:</span>
          {["HSK 1", "爱", "báitiān", "bài tập", "động từ", "danh từ"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                if (tag === "HSK 1") {
                  setLevelFilter(1);
                } else if (tag === "động từ" || tag === "danh từ") {
                  setPosFilter(tag);
                } else {
                  setQuery(tag);
                }
                setCurrentPage(1);
              }}
              className="rounded-lg border border-stone-200/70 bg-stone-50 px-2 py-0.5 text-stone-600 transition-colors hover:border-[#b84a27] hover:bg-stone-100 hover:text-[#b84a27] dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-400 dark:hover:border-[#e06d48] dark:hover:text-[#f39a7d]"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Filter Controls Row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200/70 pt-4 dark:border-stone-800/80">
          {/* Level Tabs */}
          <div className="inline-flex items-center rounded-xl border border-stone-200 bg-stone-100/60 p-1 dark:border-stone-800 dark:bg-stone-900/60">
            {[
              { id: "all", label: "Toàn bộ 1000 từ" },
              { id: 1, label: "HSK 1 (300)" },
              { id: 2, label: "HSK 2 (200)" },
              { id: 3, label: "HSK 3 (500)" },
            ].map((lvl) => {
              const active = levelFilter === lvl.id;
              return (
                <button
                  key={String(lvl.id)}
                  type="button"
                  onClick={() => {
                    setLevelFilter(lvl.id as any);
                    setCurrentPage(1);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    active
                      ? "bg-white text-stone-900 shadow-2xs dark:bg-stone-800 dark:text-stone-100"
                      : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                  }`}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>

          {/* POS & Sort Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={posFilter}
              onChange={(e) => {
                setPosFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 focus:border-[#b84a27] focus:outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
            >
              {posOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 focus:border-[#b84a27] focus:outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="starred">⭐️ Đã lưu (Favorites)</option>
              <option value="due">⏳ Đến hạn ôn tập (Due SRS)</option>
              <option value="learning">📖 Đang học</option>
              <option value="mastered">✅ Đã thuộc vững</option>
              <option value="unlearned">⭕ Chưa học</option>
              <option value="mistake">❌ Sổ tay từ khó / Sai</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 focus:border-[#b84a27] focus:outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
            >
              <option value="id">Sắp xếp: Theo STT</option>
              <option value="pinyin">Sắp xếp: Pinyin A-Z</option>
              <option value="level">Sắp xếp: Cấp độ HSK</option>
            </select>

            {/* View Mode Grid/Table */}
            <div className="inline-flex items-center rounded-xl border border-stone-200 bg-stone-100/60 p-1 dark:border-stone-800 dark:bg-stone-900/60">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`rounded-lg p-1.5 transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-stone-900 shadow-2xs dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                aria-label="Table view"
                className={`rounded-lg p-1.5 transition-all ${
                  viewMode === "table"
                    ? "bg-white text-stone-900 shadow-2xs dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="text-sm font-medium text-stone-600 dark:text-stone-400">
          Hiển thị{" "}
          <span className="font-bold text-[#b84a27] dark:text-[#f39a7d]">
            {filteredWords.length}
          </span>{" "}
          / 1000 từ vựng
          {filteredWords.length > 0 && (
            <span className="ml-2 text-xs text-stone-400">
              (Trang {currentPage} / {totalPages})
            </span>
          )}
        </div>

        {onPracticeWords && filteredWords.length > 0 && (
          <button
            type="button"
            onClick={() => onPracticeWords(filteredWords.slice(0, 30))}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#b84a27] bg-[#b84a27] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-[#9e3c1e] dark:border-[#e06d48] dark:bg-[#d46543] dark:hover:bg-[#e06d48]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Học nhanh nhóm từ này ({Math.min(filteredWords.length, 30)} từ)</span>
          </button>
        )}
      </div>

      {/* Main Words Grid or Table */}
      {filteredWords.length === 0 ? (
        <div className="studio-card rounded-2xl border p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400 dark:bg-stone-800">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-semibold text-stone-800 dark:text-stone-200">
            Không tìm thấy từ nào phù hợp
          </h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Hãy thử tìm bằng từ khóa khác hoặc bỏ bớt các bộ lọc cấp độ / từ loại.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setLevelFilter("all");
              setStatusFilter("all");
              setPosFilter("all");
            }}
            className="mt-4 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          >
            Đặt lại tất cả bộ lọc
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {paginatedWords.map((word) => {
            const progress = getWordProgress(studyData, word.id);
            const isPlaying = playingWordId === word.id;

            return (
              <div
                key={word.id}
                onClick={() => onSelectWord(word)}
                className="studio-card group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b84a27]/60 hover:shadow-md cursor-pointer dark:hover:border-[#e06d48]/60"
              >
                {/* Card Top: Badges & Star */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-md border px-1.5 py-0.5 text-2xs font-semibold ${getLevelBadgeClass(
                          word.level
                        )}`}
                      >
                        HSK {word.level}
                      </span>
                      <span className="text-2xs text-stone-400">#{word.id}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Audio Button */}
                      <button
                        type="button"
                        onClick={(e) => handlePlayAudio(e, word)}
                        aria-label={`Phát âm ${word.word}`}
                        className={`rounded-lg p-1 transition-colors ${
                          isPlaying
                            ? "bg-[#faece6] text-[#b84a27] dark:bg-[#331911] dark:text-[#f39a7d]"
                            : "text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                        }`}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                        </svg>
                      </button>

                      {/* Star Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleStar(e, word.id)}
                        aria-label="Star word"
                        className={`rounded-lg p-1 transition-colors ${
                          progress.starred
                            ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                            : "text-stone-300 hover:bg-stone-100 hover:text-stone-600 dark:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
                        }`}
                      >
                        <svg
                          className="h-4 w-4"
                          fill={progress.starred ? "currentColor" : "none"}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={progress.starred ? "1" : "2"}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Character & Pinyin */}
                  <div className="mt-3">
                    <div className="font-mono text-xs font-semibold text-[#b84a27] dark:text-[#f39a7d]">
                      {word.pinyin}
                    </div>
                    <div className="font-serif text-3xl font-bold tracking-tight text-stone-900 group-hover:text-[#b84a27] dark:text-stone-100 dark:group-hover:text-[#f39a7d]">
                      {word.word}
                    </div>
                  </div>

                  {/* Sino-Vietnamese & POS */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md border border-amber-200/80 bg-amber-50/80 px-1.5 py-0.5 text-2xs font-medium text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                      HV: {word.hanviet}
                    </span>
                    <span className="text-2xs text-stone-500 dark:text-stone-400">
                      • {word.pos}
                    </span>
                  </div>

                  {/* Vietnamese Definition */}
                  <div className="mt-2 text-xs font-semibold text-stone-800 line-clamp-2 dark:text-stone-200">
                    {word.meaningVi}
                  </div>
                </div>

                {/* Card Bottom: Status Pill */}
                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-2.5 dark:border-stone-800/80">
                  <button
                    type="button"
                    onClick={(e) => handleCycleStatus(e, word.id)}
                    title="Nhấn để đổi trạng thái học tập"
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-2xs font-semibold transition-all hover:opacity-85 ${getStatusBadgeClass(
                      progress.status
                    )}`}
                  >
                    <span>
                      {progress.status === "mastered"
                        ? "✅ Đã thuộc"
                        : progress.status === "learning"
                        ? "📖 Đang học"
                        : "⭕ Chưa học"}
                    </span>
                  </button>

                  <span className="text-2xs text-stone-400 group-hover:text-[#b84a27] dark:group-hover:text-[#f39a7d]">
                    Chi tiết →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="studio-card overflow-hidden rounded-2xl border shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700 dark:text-stone-300">
              <thead className="border-b border-stone-200 bg-stone-50/70 text-2xs font-bold text-stone-600 uppercase dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-400">
                <tr>
                  <th className="py-3 pr-2 pl-4">STT</th>
                  <th className="px-3 py-3">Chữ Hán</th>
                  <th className="px-3 py-3">Pinyin</th>
                  <th className="px-3 py-3">Âm Hán-Việt</th>
                  <th className="px-3 py-3">Nghĩa tiếng Việt</th>
                  <th className="px-3 py-3">Từ loại</th>
                  <th className="px-3 py-3">Cấp HSK</th>
                  <th className="px-3 py-3 text-center">Trạng thái</th>
                  <th className="py-3 pr-4 pl-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {paginatedWords.map((word) => {
                  const progress = getWordProgress(studyData, word.id);
                  const isPlaying = playingWordId === word.id;

                  return (
                    <tr
                      key={word.id}
                      onClick={() => onSelectWord(word)}
                      className="hover:bg-stone-50/80 cursor-pointer transition-colors dark:hover:bg-stone-900/50"
                    >
                      <td className="py-2.5 pr-2 pl-4 font-mono text-2xs text-stone-400">
                        {word.id}
                      </td>
                      <td className="px-3 py-2.5 font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                        {word.word}
                      </td>
                      <td className="px-3 py-2.5 font-mono font-medium text-[#b84a27] dark:text-[#f39a7d]">
                        {word.pinyin}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-amber-800 dark:text-amber-300">
                        {word.hanviet}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-stone-900 dark:text-stone-100">
                        {word.meaningVi}
                      </td>
                      <td className="px-3 py-2.5 text-stone-500 dark:text-stone-400">
                        {word.pos}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-2xs font-semibold ${getLevelBadgeClass(
                            word.level
                          )}`}
                        >
                          HSK {word.level}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => handleCycleStatus(e, word.id)}
                          className={`rounded-md border px-2 py-0.5 text-2xs font-semibold ${getStatusBadgeClass(
                            progress.status
                          )}`}
                        >
                          {progress.status === "mastered"
                            ? "✅ Đã thuộc"
                            : progress.status === "learning"
                            ? "📖 Đang học"
                            : "⭕ Chưa học"}
                        </button>
                      </td>
                      <td className="py-2.5 pr-4 pl-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => handlePlayAudio(e, word)}
                            className="rounded-lg p-1 text-stone-400 hover:text-[#b84a27] dark:hover:text-[#f39a7d]"
                            title="Phát âm"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleToggleStar(e, word.id)}
                            className={`rounded-lg p-1 ${
                              progress.starred
                                ? "text-amber-500"
                                : "text-stone-300 hover:text-stone-600 dark:text-stone-600 dark:hover:text-stone-300"
                            }`}
                            title="Lưu từ"
                          >
                            <svg className="h-4 w-4" fill={progress.starred ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-stone-200/80 pt-4 dark:border-stone-800">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 disabled:opacity-40 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
          >
            ← Trang trước
          </button>

          <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Trang {currentPage} / {totalPages}
          </div>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 disabled:opacity-40 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
          >
            Trang sau →
          </button>
        </div>
      )}
    </div>
  );
}

