"use client";

import React from "react";
import { normalizeWord } from "@/utils/quizUtils";
import {
  getBadgeClasses,
  getDotClasses,
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
  const topBorder = getTopBorderClasses(badgeLabel);
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
      className={`rounded-2xl border border-t-2 border-neutral-200/80 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900 ${topBorder}`}
    >
      <div className="mb-3.5 flex items-center justify-between gap-2 border-b border-neutral-100 pb-3 dark:border-neutral-800/80">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
          {indexLabel}
        </span>
        <div className="flex items-center gap-2">
          {headerBadge && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeColor}`}
            >
              {headerBadge}
            </span>
          )}
          {submitted && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                isCorrect
                  ? "border-green-300 bg-green-50 text-green-800 dark:border-green-700/80 dark:bg-green-950/60 dark:text-green-300"
                  : "border-red-300 bg-red-50 text-red-800 dark:border-red-700/80 dark:bg-red-950/60 dark:text-red-300"
              }`}
            >
              {isCorrect
                ? "Correct"
                : !userAnswer.trim()
                ? "Unanswered"
                : "Incorrect"}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 text-[15px] leading-relaxed text-neutral-900 dark:text-neutral-100">
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
              className={`mx-1.5 inline-block min-w-[170px] rounded-lg border px-3 py-1 text-sm transition-all focus:outline-none ${
                !submitted
                  ? "border-amber-300/90 bg-amber-50/40 text-neutral-900 placeholder:text-neutral-400 focus:border-amber-500 focus:bg-white dark:border-amber-700/70 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-amber-400 dark:focus:bg-neutral-900"
                  : isCorrect
                  ? "border-green-400 bg-green-50/80 font-medium text-green-900 dark:border-green-700 dark:bg-green-950/50 dark:text-green-200"
                  : "border-red-400 bg-red-50/80 text-red-900 line-through dark:border-red-700 dark:bg-red-950/50 dark:text-red-200"
              }`}
            />
            {parts.slice(1).join(" ")}
          </span>
        ) : (
          <div>
            <p className="mb-3 font-medium">{prompt}</p>
            <input
              type="text"
              disabled={submitted}
              value={userAnswer}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer..."
              className={`w-full max-w-md rounded-xl border px-3.5 py-2 text-sm transition-all focus:outline-none ${
                !submitted
                  ? "border-amber-300/80 bg-amber-50/30 text-neutral-900 placeholder:text-neutral-400 focus:border-amber-500 focus:bg-white dark:border-amber-700/70 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-amber-400 dark:focus:bg-neutral-900"
                  : isCorrect
                  ? "border-green-400 bg-green-50/80 font-medium text-green-900 dark:border-green-700 dark:bg-green-950/50 dark:text-green-200"
                  : "border-red-400 bg-red-50/80 text-red-900 dark:border-red-700 dark:bg-red-950/50 dark:text-red-200"
              }`}
            />
          </div>
        )}
      </div>

      {wordBank && wordBank.length > 0 && !submitted && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
            Choices:
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
                className={`rounded-lg border px-3 py-1 text-xs font-medium transition-all ${
                  active
                    ? "border-amber-500 bg-amber-500 text-white shadow-2xs dark:border-amber-400 dark:bg-amber-500 dark:text-neutral-950"
                    : "border-amber-200/90 bg-amber-50/50 text-amber-900 hover:border-amber-400 hover:bg-amber-100/60 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:border-amber-600 dark:hover:bg-amber-900/50"
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
      )}

      {!submitted && onSubmit && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3.5 dark:border-neutral-800/80">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {userAnswer.trim()
              ? "Press Enter or click Submit to check your answer."
              : "Type your answer or click a choice above, then click Submit."}
          </span>
          <button
            type="button"
            onClick={onSubmit}
            className={`rounded-xl border px-4 py-1.5 text-xs font-semibold shadow-2xs transition-all ${submitBtnClass}`}
          >
            Submit Answer
          </button>
        </div>
      )}

      {submitted && (
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-neutral-100 pt-3.5 text-xs text-neutral-700 dark:border-neutral-800/80 dark:text-neutral-300">
          <div className="space-y-1">
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                Correct Answer:{" "}
              </span>
              <span className="font-medium text-green-700 dark:text-green-400">
                {correctAnswer}
              </span>
            </div>
            {note && (
              <div className="text-neutral-600 dark:text-neutral-400">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
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
              className="shrink-0 rounded-xl border border-neutral-200/90 bg-neutral-50/80 px-3.5 py-1.5 text-xs font-medium text-neutral-700 transition-all hover:border-neutral-400 hover:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
            >
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
