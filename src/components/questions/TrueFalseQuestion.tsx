"use client";

import React from "react";
import {
  getBadgeClasses,
  getDotClasses,
  getHeaderBandClasses,
  getSubmitButtonClasses,
  getTopBorderClasses,
} from "@/utils/themeColors";

export interface TrueFalseQuestionProps {
  indexLabel: string;
  statement: string;
  selectedValue?: boolean;
  correctAnswer: boolean;
  submitted: boolean;
  evidence?: string;
  headerBadge?: string;
  preContent?: React.ReactNode;
  reverseOptions?: boolean;
  onSelect: (value: boolean) => void;
  onSubmit?: () => void;
  onReset?: () => void;
}

export function TrueFalseQuestion({
  indexLabel,
  statement,
  selectedValue,
  correctAnswer,
  submitted,
  evidence,
  headerBadge,
  preContent,
  reverseOptions = false,
  onSelect,
  onSubmit,
  onReset,
}: TrueFalseQuestionProps) {
  const isAnswered = selectedValue !== undefined;
  const isCorrect = submitted && isAnswered && selectedValue === correctAnswer;
  const badgeLabel = headerBadge || "True / False";
  const leftBorder = getTopBorderClasses(badgeLabel);
  const headerBand = getHeaderBandClasses(badgeLabel);
  const dotColor = getDotClasses(badgeLabel);
  const badgeColor = getBadgeClasses(badgeLabel);
  const submitBtnClass = getSubmitButtonClasses(badgeLabel);

  const options = reverseOptions
    ? [
        { label: "False (F)", keycap: "F", value: false },
        { label: "True (T)", keycap: "T", value: true },
      ]
    : [
        { label: "True (T)", keycap: "T", value: true },
        { label: "False (F)", keycap: "F", value: false },
      ];

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
                : !isAnswered
                ? "Unanswered"
                : "✗ Incorrect"}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {preContent && <div className="mb-4">{preContent}</div>}

        <p className="mb-5 text-[15.5px] font-semibold leading-relaxed text-stone-900 dark:text-stone-100">
          {statement}
        </p>

        <div className="flex flex-wrap gap-3">
          {options.map((opt) => {
            const isSelected = selectedValue === opt.value;
            const isThisCorrect = opt.value === correctAnswer;

            let btnClass =
              "border-stone-200/90 bg-stone-50/50 text-stone-800 hover:border-stone-400 hover:bg-stone-100/70 dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-200 dark:hover:border-stone-600 dark:hover:bg-stone-800/60";
            let keycapClass =
              "border-stone-300 bg-white text-stone-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-400";

            if (!submitted && isSelected) {
              btnClass =
                "border-[#6e3556] bg-[#f7eff3] text-[#451d34] font-semibold shadow-2xs dark:border-[#c97da8] dark:bg-[#2a1521] dark:text-[#f2d5e5]";
              keycapClass =
                "border-[#6e3556] bg-[#6e3556] text-white dark:border-[#c97da8] dark:bg-[#c97da8] dark:text-stone-950";
            } else if (submitted) {
              if (isThisCorrect) {
                btnClass =
                  "border-emerald-500/80 bg-emerald-50/80 text-emerald-950 font-semibold dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-200";
                keycapClass =
                  "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-stone-950";
              } else if (isSelected && !isThisCorrect) {
                btnClass =
                  "border-rose-400 bg-rose-50/80 text-rose-900 line-through dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200";
                keycapClass =
                  "border-rose-500 bg-rose-500 text-white dark:border-rose-500 dark:bg-rose-500 dark:text-white";
              } else {
                btnClass =
                  "border-stone-200/60 bg-stone-50/40 text-stone-400 dark:border-stone-800/60 dark:bg-stone-900/30 dark:text-stone-600";
              }
            }

            return (
              <button
                key={opt.label}
                type="button"
                disabled={submitted}
                onClick={() => onSelect(opt.value)}
                className={`inline-flex min-w-[155px] items-center gap-2.5 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all ${btnClass} ${
                  submitted ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <span
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] font-bold ${keycapClass}`}
                >
                  {opt.keycap}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {!submitted && onSubmit && (
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-200/70 pt-4 dark:border-stone-800/80">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {isAnswered
                ? "Selection ready — click Submit to verify."
                : "Choose True or False above, then click Submit."}
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
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {correctAnswer ? "True (T)" : "False (F)"}
                </span>
              </div>
              {evidence && (
                <div className="text-stone-600 dark:text-stone-400">
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    Evidence / Note:{" "}
                  </span>
                  {evidence}
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
