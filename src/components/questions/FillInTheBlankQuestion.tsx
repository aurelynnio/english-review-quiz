"use client";

import React from "react";
import { normalizeWord } from "@/utils/quizUtils";
import {
  getBadgeClasses,
  getDotClasses,
  getHeaderBandClasses,
  getSubmitButtonClasses,
  getTopBorderClasses,
} from "@/utils/themeColors";

export interface FillInTheBlankQuestionProps {
  indexLabel: string;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  submitted: boolean;
  note?: string;
  wordBank?: string[];
  headerBadge?: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onReset?: () => void;
}

export function isFillBlankCorrect(
  userAnswer: string,
  correctAnswer: string
): boolean {
  const u = userAnswer
    .trim()
    .split(/\s+/)
    .map(normalizeWord)
    .filter(Boolean)
    .join(" ");
  const c = correctAnswer
    .trim()
    .split(/\s+/)
    .map(normalizeWord)
    .filter(Boolean)
    .join(" ");
  return u !== "" && u === c;
}

export function FillInTheBlankQuestion({
  indexLabel,
  prompt,
  userAnswer,
  correctAnswer,
  submitted,
  note,
  wordBank,
  headerBadge,
  onChange,
  onSubmit,
  onReset,
}: FillInTheBlankQuestionProps) {
  const isCorrect = submitted && isFillBlankCorrect(userAnswer, correctAnswer);
  const parts = prompt.split(/_{3,}|\(\d+\)\s*_{3,}/);
  const badgeLabel = headerBadge || "Fill in the Blank";
  const leftBorder = getTopBorderClasses(badgeLabel);
  const headerBand = getHeaderBandClasses(badgeLabel);
  const dotColor = getDotClasses(badgeLabel);
  const badgeColor = getBadgeClasses(badgeLabel);
  const submitBtnClass = getSubmitButtonClasses(badgeLabel);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !submitted && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div
      className={`studio-card overflow-hidden rounded-2xl border border-l-[3px] transition-all ${leftBorder}`}
    >
      {/* Tinted Editorial Header Band */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 border-b px-6 py-3 ${headerBand}`}
      >
        <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wide text-stone-700 dark:text-stone-200">
          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
          {indexLabel}
        </span>
        <div className="flex items-center gap-2">
          {headerBadge && (
            <span
              className={`rounded-md border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${badgeColor}`}
            >
              {headerBadge}
            </span>
          )}
          {submitted && (
            <span
              className={`rounded-md border px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-700/80 dark:bg-rose-950/60 dark:text-rose-300"
              }`}
            >
              {isCorrect
                ? "✓ Correct"
                : !userAnswer.trim()
                ? "Unanswered"
                : "✗ Incorrect"}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 text-[15.5px] leading-relaxed text-stone-900 dark:text-stone-100">
          {parts.length > 1 ? (
            <span>
              {parts[0]}
              <input
                type="text"
                disabled={submitted}
                value={userAnswer}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="type missing word(s)"
                className={`mx-1.5 inline-block min-w-[180px] rounded-lg border px-3 py-1 font-mono text-sm transition-all focus:outline-none ${
                  !submitted
                    ? "border-[#d89c4a] bg-[#faf2e3] text-stone-900 placeholder:text-stone-400 focus:border-[#a36c1d] focus:bg-white dark:border-[#784f12] dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-[#e0a84e] dark:focus:bg-stone-900"
                    : isCorrect
                    ? "border-emerald-500 bg-emerald-50/80 font-semibold text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200"
                    : "border-rose-400 bg-rose-50/80 text-rose-900 line-through dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-200"
                }`}
              />
              {parts.slice(1).join(" ")}
            </span>
          ) : (
            <div>
              <p className="mb-3 font-semibold">{prompt}</p>
              <input
                type="text"
                disabled={submitted}
                value={userAnswer}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                className={`w-full max-w-md rounded-xl border px-3.5 py-2 font-mono text-sm transition-all focus:outline-none ${
                  !submitted
                    ? "border-[#d89c4a] bg-[#faf2e3]/60 text-stone-900 placeholder:text-stone-400 focus:border-[#a36c1d] focus:bg-white dark:border-[#784f12] dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-[#e0a84e] dark:focus:bg-stone-900"
                    : isCorrect
                    ? "border-emerald-500 bg-emerald-50/80 font-semibold text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200"
                    : "border-rose-400 bg-rose-50/80 text-rose-900 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-200"
                }`}
              />
            </div>
          )}
        </div>

        {wordBank && wordBank.length > 0 && !submitted && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-[#784f12] dark:text-[#f2cf94]">
              Word Bank:
            </span>
            {wordBank.map((word, idx) => {
              const active =
                normalizeWord(userAnswer) === normalizeWord(word) &&
                userAnswer.trim() !== "";
              return (
                <button
                  key={`${word}-${idx}`}
                  type="button"
                  onClick={() => onChange(word)}
                  className={`rounded-lg border px-3 py-1 font-mono text-xs font-medium transition-all ${
                    active
                      ? "border-[#a36c1d] bg-[#a36c1d] text-white shadow-2xs dark:border-[#e0a84e] dark:bg-[#e0a84e] dark:text-stone-950"
                      : "border-[#e6cda5] bg-[#faf2e3] text-[#784f12] hover:border-[#a36c1d] hover:bg-[#f3e4c8] dark:border-[#63410e] dark:bg-[#2b1f0d] dark:text-[#f2cf94] dark:hover:border-[#e0a84e]"
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
        )}

        {!submitted && onSubmit && (
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-200/70 pt-4 dark:border-stone-800/80">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {userAnswer.trim()
                ? "Press Enter or click Submit to check your answer."
                : "Type your answer or click a choice above, then click Submit."}
            </span>
            <button
              type="button"
              onClick={onSubmit}
              className={`rounded-xl border px-4 py-2 text-xs font-semibold shadow-2xs transition-all ${submitBtnClass}`}
            >
              Submit Answer
            </button>
          </div>
        )}

        {submitted && (
          <div className="mt-5 flex flex-wrap items-start justify-between gap-3 border-t border-stone-200/70 pt-4 text-xs text-stone-700 dark:border-stone-800/80 dark:text-stone-300">
            <div className="space-y-1">
              <div>
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  Correct Answer:{" "}
                </span>
                <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  {correctAnswer}
                </span>
              </div>
              {note && (
                <div className="text-stone-600 dark:text-stone-400">
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    Note:{" "}
                  </span>
                  {note}
                </div>
              )}
            </div>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="shrink-0 rounded-xl border border-stone-300/90 bg-stone-100/80 px-3.5 py-1.5 text-xs font-semibold text-stone-700 transition-all hover:border-stone-400 hover:bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-stone-500 dark:hover:bg-stone-800"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
