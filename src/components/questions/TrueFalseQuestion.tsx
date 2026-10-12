"use client";

import React from "react";
import {
  getBadgeClasses,
  getDotClasses,
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
  const topBorder = getTopBorderClasses(badgeLabel);
  const dotColor = getDotClasses(badgeLabel);
  const badgeColor = getBadgeClasses(badgeLabel);
  const submitBtnClass = getSubmitButtonClasses(badgeLabel);

  const options = reverseOptions
    ? [
        { label: "False (F)", value: false },
        { label: "True (T)", value: true },
      ]
    : [
        { label: "True (T)", value: true },
        { label: "False (F)", value: false },
      ];

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
                : !isAnswered
                ? "Unanswered"
                : "Incorrect"}
            </span>
          )}
        </div>
      </div>

      {preContent && <div className="mb-4">{preContent}</div>}

      <p className="mb-5 text-[15px] font-medium leading-relaxed text-neutral-900 dark:text-neutral-100">
        {statement}
      </p>

      <div className="flex flex-wrap gap-3">
        {options.map((opt) => {
          const isSelected = selectedValue === opt.value;
          const isThisCorrect = opt.value === correctAnswer;

          let btnClass =
            "border-neutral-200/90 bg-neutral-50/40 text-neutral-800 hover:border-violet-300 hover:bg-violet-50/40 dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-200 dark:hover:border-violet-700/70 dark:hover:bg-violet-950/30";

          if (!submitted && isSelected) {
            btnClass =
              "border-violet-500 bg-violet-50/90 text-violet-950 font-semibold shadow-2xs dark:border-violet-500/90 dark:bg-violet-950/60 dark:text-violet-100";
          } else if (submitted) {
            if (isThisCorrect) {
              btnClass =
                "border-green-400 bg-green-50/80 text-green-900 font-medium dark:border-green-700 dark:bg-green-950/40 dark:text-green-200";
            } else if (isSelected && !isThisCorrect) {
              btnClass =
                "border-red-400 bg-red-50/80 text-red-900 line-through dark:border-red-700 dark:bg-red-950/40 dark:text-red-200";
            } else {
              btnClass =
                "border-neutral-200/60 bg-neutral-50/50 text-neutral-400 dark:border-neutral-800/60 dark:bg-neutral-900/40 dark:text-neutral-600";
            }
          }

          return (
            <button
              key={opt.label}
              type="button"
              disabled={submitted}
              onClick={() => onSelect(opt.value)}
              className={`min-w-[140px] rounded-xl border px-5 py-2.5 text-xs font-medium transition-all ${btnClass} ${
                submitted ? "cursor-default" : "cursor-pointer"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {!submitted && onSubmit && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3.5 dark:border-neutral-800/80">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {isAnswered
              ? "Selection ready — click Submit to verify."
              : "Choose True or False above, then click Submit."}
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
                {correctAnswer ? "True (T)" : "False (F)"}
              </span>
            </div>
            {evidence && (
              <div className="text-neutral-600 dark:text-neutral-400">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
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
