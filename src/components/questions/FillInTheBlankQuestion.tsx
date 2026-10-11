"use client";

import React from "react";
import { normalizeWord } from "@/utils/quizUtils";

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
}: FillInTheBlankQuestionProps) {
  const isCorrect = submitted && isFillBlankCorrect(userAnswer, correctAnswer);
  const parts = prompt.split(/_{3,}|\(\d+\)\s*_{3,}/);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
      <div className="mb-3.5 flex items-center justify-between gap-2 border-b border-neutral-100 pb-3 dark:border-neutral-800/80">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {indexLabel}
        </span>
        <div className="flex items-center gap-2">
          {headerBadge && (
            <span className="rounded-full border border-neutral-200/80 bg-neutral-100/70 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600 dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-300">
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
              placeholder="type missing word(s)"
              className={`mx-1.5 inline-block min-w-[170px] rounded-lg border px-3 py-1 text-sm transition-all focus:outline-none ${
                !submitted
                  ? "border-neutral-300 bg-neutral-50/80 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
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
              placeholder="Type your answer..."
              className={`w-full max-w-md rounded-xl border px-3.5 py-2 text-sm transition-all focus:outline-none ${
                !submitted
                  ? "border-neutral-200 bg-neutral-50/60 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
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
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
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
                    ? "border-neutral-900 bg-neutral-900 text-white shadow-2xs dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                    : "border-neutral-200/90 bg-neutral-50/70 text-neutral-700 hover:border-neutral-300 hover:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
      )}

      {submitted && (
        <div className="mt-4 border-t border-neutral-100 pt-3.5 text-xs text-neutral-700 dark:border-neutral-800/80 dark:text-neutral-300">
          <div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              Correct Answer:{" "}
            </span>
            <span className="font-medium text-green-700 dark:text-green-400">
              {correctAnswer}
            </span>
          </div>
          {note && (
            <div className="mt-1 text-neutral-600 dark:text-neutral-400">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                Note:{" "}
              </span>
              {note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
