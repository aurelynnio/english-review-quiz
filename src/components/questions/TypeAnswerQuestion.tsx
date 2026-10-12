"use client";

import React from "react";
import { evaluateWritingAnswer } from "@/utils/quizUtils";
import {
  getBadgeClasses,
  getDotClasses,
  getHeaderBandClasses,
  getSubmitButtonClasses,
  getTopBorderClasses,
} from "@/utils/themeColors";

export interface TypeAnswerQuestionProps {
  indexLabel: string;
  originalSentence: string;
  keyword?: string;
  userAnswer: string;
  modelAnswer: string;
  acceptedAnswers: string[];
  note?: string;
  submitted: boolean;
  headerBadge?: string;
  preContent?: React.ReactNode;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onReset?: () => void;
}

export function TypeAnswerQuestion({
  indexLabel,
  originalSentence,
  keyword,
  userAnswer,
  modelAnswer,
  acceptedAnswers,
  note,
  submitted,
  headerBadge,
  preContent,
  placeholder = "Type the transformed sentence...",
  onChange,
  onSubmit,
  onReset,
}: TypeAnswerQuestionProps) {
  const diffResult = submitted
    ? evaluateWritingAnswer(
        userAnswer,
        acceptedAnswers.length ? acceptedAnswers : [modelAnswer]
      )
    : null;

  const isExact = diffResult?.isExactMatch ?? false;
  const leftBorder = getTopBorderClasses(headerBadge);
  const headerBand = getHeaderBandClasses(headerBadge);
  const dotColor = getDotClasses(headerBadge);
  const badgeColor = getBadgeClasses(headerBadge);
  const submitBtnClass = getSubmitButtonClasses(headerBadge);

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
          {submitted && diffResult && (
            <span
              className={`rounded-md border px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase ${
                isExact
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-700/80 dark:bg-rose-950/60 dark:text-rose-300"
              }`}
            >
              {isExact
                ? "✓ Correct (100%)"
                : `Word Match: ${diffResult.accuracyPercent}%`}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {preContent && <div className="mb-4">{preContent}</div>}

        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-baseline">
          <p className="text-[15.5px] font-semibold leading-relaxed text-stone-900 dark:text-stone-100">
            {originalSentence}
          </p>
          {keyword && (
            <div className="shrink-0">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                Keyword:{" "}
              </span>
              <span className="rounded-md border border-[#e6cda5] bg-[#faf2e3] px-2.5 py-1 font-mono text-xs font-bold text-[#784f12] dark:border-[#63410e] dark:bg-[#2b1f0d] dark:text-[#f2cf94]">
                ({keyword})
              </span>
            </div>
          )}
        </div>

        <div>
          <input
            type="text"
            disabled={submitted}
            value={userAnswer}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all focus:outline-none ${
              !submitted
                ? "border-stone-300/90 bg-stone-50/70 text-stone-900 placeholder:text-stone-400 focus:border-[#b84a27] focus:bg-white dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-[#e2724d] dark:focus:bg-stone-900"
                : isExact
                ? "border-emerald-500 bg-emerald-50/80 font-semibold text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200"
                : "border-rose-400 bg-rose-50/40 text-stone-900 dark:border-rose-700 dark:bg-rose-950/30 dark:text-stone-100"
            }`}
          />
        </div>

        {!submitted && onSubmit && (
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-200/70 pt-4 dark:border-stone-800/80">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {userAnswer.trim()
                ? "Press Enter or click Submit to compare word-by-word."
                : "Type your sentence above, then press Enter or click Submit."}
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

        {submitted && diffResult && (
          <div className="mt-5 space-y-3 border-t border-stone-200/70 pt-4 text-xs dark:border-stone-800/80">
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400">
                  Word-Level Diff Analysis
                </span>
                <div className="flex flex-wrap gap-3 font-mono text-[11px] font-semibold">
                  <span className="text-emerald-700 dark:text-emerald-400">
                    Correct: {diffResult.correctCount}
                  </span>
                  <span className="text-rose-700 dark:text-rose-400">
                    Wrong: {diffResult.wrongCount}
                  </span>
                  <span className="text-rose-700 dark:text-rose-400">
                    Missing: {diffResult.missingCount}
                  </span>
                </div>
              </div>

              <div className="studio-subcard flex flex-wrap items-center gap-1.5 rounded-xl border p-3.5 text-sm leading-relaxed">
                {diffResult.tokens.map((token, idx) => {
                  if (token.type === "correct") {
                    return (
                      <span
                        key={idx}
                        title="Correct word"
                        className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-medium text-emerald-900 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-200"
                      >
                        {token.text}
                      </span>
                    );
                  }
                  if (token.type === "wrong") {
                    return (
                      <span
                        key={idx}
                        title="Wrong / extra word in your answer"
                        className="rounded-md border border-rose-300 bg-rose-50 px-2 py-0.5 text-rose-900 line-through dark:border-rose-700/80 dark:bg-rose-950/60 dark:text-rose-200"
                      >
                        {token.text}
                      </span>
                    );
                  }
                  return (
                    <span
                      key={idx}
                      title="Missing word from model answer"
                      className="rounded-md border border-dashed border-rose-400 bg-rose-50/60 px-2 py-0.5 font-mono text-xs text-rose-800 dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
                    >
                      missing: {token.text}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-3 pt-1">
              <div className="space-y-1">
                <div>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">
                    Model Answer:{" "}
                  </span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {modelAnswer}
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
          </div>
        )}
      </div>
    </div>
  );
}
