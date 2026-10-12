"use client";

import React from "react";
import {
  getBadgeClasses,
  getDotClasses,
  getHeaderBandClasses,
  getSubmitButtonClasses,
  getTopBorderClasses,
} from "@/utils/themeColors";

export interface MultipleChoiceQuestionProps {
  indexLabel: string;
  prompt: string;
  options: string[];
  selectedOption?: string;
  correctAnswer: string;
  submitted: boolean;
  note?: string;
  headerBadge?: string;
  preContent?: React.ReactNode;
  onSelect: (option: string) => void;
  onSubmit?: () => void;
  onReset?: () => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export function MultipleChoiceQuestion({
  indexLabel,
  prompt,
  options,
  selectedOption,
  correctAnswer,
  submitted,
  note,
  headerBadge,
  preContent,
  onSelect,
  onSubmit,
  onReset,
}: MultipleChoiceQuestionProps) {
  const isCorrect = submitted && selectedOption === correctAnswer;
  const isUnanswered = submitted && !selectedOption;
  const badgeLabel = headerBadge || "Multiple Choice";
  const topBorder = getTopBorderClasses(badgeLabel);
  const headerBand = getHeaderBandClasses(badgeLabel);
  const dotColor = getDotClasses(badgeLabel);
  const badgeColor = getBadgeClasses(badgeLabel);
  const submitBtnClass = getSubmitButtonClasses(badgeLabel);

  return (
    <div className={`overflow-hidden rounded-2xl border p-6 ${topBorder}`}>
      <div
        className={`-mx-6 -mt-6 mb-5 flex flex-wrap items-center justify-between gap-2 border-b px-6 py-3.5 ${headerBand}`}
      >
        <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-stone-700 dark:text-stone-300">
          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
          {indexLabel}
        </span>
        <div className="flex items-center gap-2">
          {headerBadge && (
            <span
              className={`rounded-md border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${badgeColor}`}
            >
              {headerBadge}
            </span>
          )}
          {submitted && (
            <span
              className={`rounded-md border px-2.5 py-0.5 font-mono text-[11px] font-semibold ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "border-red-300 bg-red-50 text-red-800 dark:border-red-700/80 dark:bg-red-950/60 dark:text-red-300"
              }`}
            >
              {isCorrect
                ? "✓ Correct"
                : isUnanswered
                ? "Unanswered"
                : "✕ Incorrect"}
            </span>
          )}
        </div>
      </div>

      {preContent && <div className="mb-5">{preContent}</div>}

      <p className="mb-5 text-[15px] font-medium leading-relaxed text-stone-900 dark:text-stone-100">
        {prompt}
      </p>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isThisCorrect = option === correctAnswer;

          let buttonStyle =
            "studio-subcard text-stone-800 hover:border-[#1f5c44]/60 hover:bg-[#e6f2ec]/50 dark:text-stone-200 dark:hover:border-[#52b788]/60 dark:hover:bg-[#12291f]/40";

          if (!submitted && isSelected) {
            buttonStyle =
              "border-[#1f5c44] bg-[#e6f2ec] text-[#113828] font-semibold shadow-2xs dark:border-[#52b788] dark:bg-[#163628] dark:text-[#b8f2d6]";
          } else if (submitted) {
            if (isThisCorrect) {
              buttonStyle =
                "border-emerald-500 bg-emerald-50/90 text-emerald-950 font-semibold dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200";
            } else if (isSelected && !isThisCorrect) {
              buttonStyle =
                "border-red-400 bg-red-50/80 text-red-900 line-through dark:border-red-700 dark:bg-red-950/40 dark:text-red-200";
            } else {
              buttonStyle =
                "border-stone-200/60 bg-stone-100/40 text-stone-400 dark:border-stone-800/60 dark:bg-stone-900/30 dark:text-stone-600";
            }
          }

          return (
            <button
              key={`${option}-${idx}`}
              type="button"
              disabled={submitted}
              onClick={() => onSelect(option)}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${buttonStyle} ${
                submitted ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <span
                className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-bold ${
                  !submitted && isSelected
                    ? "border-[#1f5c44] bg-[#1f5c44] text-white dark:border-[#52b788] dark:bg-[#52b788] dark:text-stone-950"
                    : submitted && isThisCorrect
                    ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-stone-950"
                    : submitted && isSelected && !isThisCorrect
                    ? "border-red-500 bg-red-100 text-red-800 dark:border-red-600 dark:bg-red-900/50 dark:text-red-200"
                    : "border-stone-300 bg-white/90 text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                }`}
              >
                {OPTION_LETTERS[idx] ?? idx + 1}
              </span>
              <span className="leading-snug">{option}</span>
            </button>
          );
        })}
      </div>

      {!submitted && onSubmit && (
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-200/70 pt-4 dark:border-stone-800/80">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {selectedOption
              ? "Option selected — click Submit Answer to check."
              : "Select an option above, then click Submit Answer."}
          </span>
          <button
            type="button"
            onClick={onSubmit}
            className={`rounded-xl border px-4 py-1.5 text-xs font-semibold shadow-2xs transition-all ${submitBtnClass}`}
          >
            Submit Answer →
          </button>
        </div>
      )}

      {submitted && (
        <div className="mt-5 flex flex-wrap items-start justify-between gap-3 border-t border-stone-200/70 pt-4 text-xs text-stone-700 dark:border-stone-800/80 dark:text-stone-300">
          <div className="flex-1 space-y-2">
            <div>
              <span className="font-semibold text-stone-900 dark:text-stone-100">
                Correct Answer:{" "}
              </span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {correctAnswer}
              </span>
            </div>
            {note && (
              <div
                className={`rounded-xl border px-3.5 py-2.5 leading-relaxed ${
                  isCorrect
                    ? "border-emerald-300/80 bg-emerald-50/70 text-emerald-950 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-100"
                    : "border-amber-300/90 bg-amber-50/80 text-stone-800 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100"
                }`}
              >
                <span className="mr-1.5 inline-block rounded bg-stone-900/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider dark:bg-white/10">
                  Dẫn chứng / Giải thích
                </span>
                <span>{note}</span>
              </div>
            )}
          </div>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="studio-subcard shrink-0 rounded-xl border px-3.5 py-1.5 text-xs font-semibold text-stone-700 transition-all hover:border-stone-400 dark:text-stone-200 dark:hover:border-stone-600"
            >
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
