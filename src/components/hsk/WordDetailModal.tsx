"use client";

import React, { useState } from "react";
import { HskWord } from "@/data/hskWords";
import {
  UserStudyData,
  getWordProgress,
  setWordStatus,
  toggleWordStar,
  clearMistakeRecord,
  playChineseAudio,
  saveStudyData,
} from "@/utils/hskUtils";
import { getLevelBadgeClass, getStatusBadgeClass } from "@/utils/themeColors";

interface WordDetailModalProps {
  word: HskWord | null;
  onClose: () => void;
  studyData: UserStudyData;
  onUpdateStudyData: (nextData: UserStudyData) => void;
  onStartWordPractice?: (word: HskWord) => void;
}

export function WordDetailModal({
  word,
  onClose,
  studyData,
  onUpdateStudyData,
  onStartWordPractice,
}: WordDetailModalProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);

  if (!word) return null;

  const progress = getWordProgress(studyData, word.id);

  const handlePlayAudio = async (rate: number = 0.9) => {
    setIsPlayingAudio(true);
    await playChineseAudio(word.word, rate);
    setIsPlayingAudio(false);
  };

  const handleStatusChange = (status: "unlearned" | "learning" | "mastered") => {
    const next = setWordStatus(studyData, word.id, status);
    onUpdateStudyData(next);
  };

  const handleToggleStar = () => {
    const next = toggleWordStar(studyData, word.id);
    onUpdateStudyData(next);
  };

  const handleClearMistakes = () => {
    const next = clearMistakeRecord(studyData, word.id);
    onUpdateStudyData(next);
  };

  const handleSaveNote = () => {
    const current = getWordProgress(studyData, word.id);
    const updated = {
      ...current,
      notes: noteText.trim(),
    };
    const nextData: UserStudyData = {
      ...studyData,
      words: {
        ...studyData.words,
        [word.id]: updated,
      },
    };
    saveStudyData(nextData);
    onUpdateStudyData(nextData);
    setIsEditingNote(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs bg-black/45 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="studio-card relative w-full max-w-lg overflow-hidden rounded-2xl border p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Level & Close */}
        <div className="flex items-center justify-between border-b border-[#e3dcce]/70 pb-4 dark:border-[#332b24]">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${getLevelBadgeClass(
                word.level
              )}`}
            >
              HSK 3.0 — Cấp {word.level}
            </span>
            {word.oldLevel && word.oldLevel !== "—" && (
              <span className="rounded-md border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
                HSK 2.0: Cấp {word.oldLevel}
              </span>
            )}
            <span className="text-xs text-stone-400">#STT {word.id}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleStar}
              aria-label="Star word"
              className={`rounded-xl p-2 transition-colors ${
                progress.starred
                  ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                  : "text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-300"
              }`}
            >
              <svg
                className="h-5 w-5"
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
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-300"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Word Display Area */}
        <div className="py-6 text-center">
          <div className="mb-2 inline-flex items-center gap-2">
            <span className="font-mono text-xl font-medium tracking-wide text-[#b84a27] dark:text-[#f39a7d]">
              {word.pinyin}
            </span>
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePlayAudio(0.9)}
                disabled={isPlayingAudio}
                title="Phát âm tiếng Trung (Tốc độ chuẩn)"
                className="inline-flex items-center gap-1 rounded-full border border-[#ded3c3] bg-[#fdfbf7] px-2.5 py-1 text-xs font-semibold text-stone-700 shadow-2xs hover:border-[#b84a27] hover:text-[#b84a27] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-[#e06d48]"
              >
                <svg
                  className="h-3.5 w-3.5 text-[#b84a27] dark:text-[#f39a7d]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.757 3.63 8.25 4.51 8.25H6.75z"
                  />
                </svg>
                <span>Phát âm</span>
              </button>
              <button
                type="button"
                onClick={() => handlePlayAudio(0.65)}
                disabled={isPlayingAudio}
                title="Phát âm chậm 0.65x"
                className="rounded-full border border-[#ded3c3] bg-[#fdfbf7] px-2 py-1 text-2xs font-medium text-stone-600 hover:border-[#b84a27] hover:text-[#b84a27] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400"
              >
                Chậm 0.65x
              </button>
            </div>
          </div>

          <h2 className="font-serif text-5xl font-bold tracking-tight text-[#1c1815] dark:text-[#f4efe6] md:text-6xl">
            {word.word}
          </h2>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
              Âm Hán-Việt: {word.hanviet}
            </span>
            <span className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
              {word.pos}
            </span>
          </div>
        </div>

        {/* Definitions Card */}
        <div className="studio-subcard space-y-3 rounded-xl border p-4">
          <div>
            <div className="text-2xs font-semibold tracking-wider text-stone-500 uppercase dark:text-stone-400">
              Nghĩa tiếng Việt
            </div>
            <div className="mt-0.5 text-base font-semibold text-stone-900 dark:text-stone-100">
              {word.meaningVi}
            </div>
          </div>

          {word.meaningEn && (
            <div className="border-t border-stone-200/60 pt-2.5 dark:border-stone-700/60">
              <div className="text-2xs font-semibold tracking-wider text-stone-500 uppercase dark:text-stone-400">
                Nghĩa tiếng Anh (English)
              </div>
              <div className="mt-0.5 text-sm text-stone-700 dark:text-stone-300">
                {word.meaningEn}
              </div>
            </div>
          )}
        </div>

        {/* Mastery Status & SRS */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-600 dark:text-stone-400">
              Trạng thái học tập:
            </span>
            <span
              className={`rounded-md border px-2 py-0.5 font-medium ${getStatusBadgeClass(
                progress.status
              )}`}
            >
              {progress.status === "mastered"
                ? "Đã nắm vững"
                : progress.status === "learning"
                ? "Đang học"
                : "Chưa học"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleStatusChange("unlearned")}
              className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                progress.status === "unlearned"
                  ? "border-stone-600 bg-stone-800 text-white dark:border-stone-400 dark:bg-stone-200 dark:text-stone-900"
                  : "border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-900"
              }`}
            >
              ⭕ Chưa học
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange("learning")}
              className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                progress.status === "learning"
                  ? "border-amber-600 bg-amber-600 text-white dark:border-amber-500 dark:bg-amber-600 dark:text-white"
                  : "border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-900"
              }`}
            >
              📖 Đang học
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange("mastered")}
              className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                progress.status === "mastered"
                  ? "border-[#1f5c44] bg-[#1f5c44] text-white dark:border-[#52b788] dark:bg-[#287255] dark:text-white"
                  : "border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-900"
              }`}
            >
              ✅ Đã thuộc
            </button>
          </div>

          {progress.mistakeCount > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50/70 p-2.5 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              <span className="flex items-center gap-1.5 font-medium">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Đã sai {progress.mistakeCount} lần trong sổ tay
              </span>
              <button
                type="button"
                onClick={handleClearMistakes}
                className="underline hover:text-red-950 dark:hover:text-red-100"
              >
                Xóa lỗi
              </button>
            </div>
          )}
        </div>

        {/* Action Bottom Bar */}
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#e3dcce]/70 pt-4 dark:border-[#332b24]">
          {onStartWordPractice && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartWordPractice(word);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#b84a27] bg-[#b84a27] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#9e3c1e] dark:border-[#e06d48] dark:bg-[#d46543] dark:hover:bg-[#e06d48]"
            >
              <span>Luyện từ này ngay</span>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

