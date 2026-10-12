"use client";

import React from "react";
import {
  getBadgeClasses,
  getDotClasses,
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
  const dotColor = getDotClasses(badgeLabel);
  const badgeColor = getBadgeClasses(badgeLabel);
  const submitBtnClass = getSubmitButtonClasses(badgeLabel);

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
                : isUnanswered
                ? "Unanswered"
                : "Incorrect"}
            </span>
          )}
        </div>
      </div>

      {preContent && <div className="mb-4">{preContent}</div>}

      <p className="mb-5 text-[15px] font-medium leading-relaxed text-neutral-900 dark:text-neutral-100">
        {prompt}
      </p>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isThisCorrect = option === correctAnswer;

          let buttonStyle =
            "border-neutral-200/90 bg-neutral-50/40 text-neutral-800 hover:border-sky-300 hover:bg-sky-50/40 dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-200 dark:hover:border-sky-700/70 dark:hover:bg-sky-950/30";

          if (!submitted && isSelected) {
            buttonStyle =
              "border-sky-500 bg-sky-50/90 text-sky-950 font-semibold shadow-2xs dark:border-sky-500/90 dark:bg-sky-950/60 dark:text-sky-100";
          } else if (submitted) {
            if (isThisCorrect) {
              buttonStyle =
                "border-green-400 bg-green-50/80 text-green-900 font-medium dark:border-green-700 dark:bg-green-950/40 dark:text-green-200";
            } else if (isSelected && !isThisCorrect) {
              buttonStyle =
                "border-red-400 bg-red-50/80 text-red-900 line-through dark:border-red-700 dark:bg-red-950/40 dark:text-red-200";
            } else {
              buttonStyle =
                "border-neutral-200/60 bg-neutral-50/50 text-neutral-400 dark:border-neutral-800/60 dark:bg-neutral-900/40 dark:text-neutral-600";
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
                className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  !submitted && isSelected
                    ? "border-sky-600 bg-sky-600 text-white dark:border-sky-400 dark:bg-sky-500 dark:text-neutral-950"
                    : submitted && isThisCorrect
                    ? "border-green-500 bg-green-100/70 text-green-800 dark:border-green-600 dark:bg-green-900/40 dark:text-green-300"
                    : submitted && isSelected && !isThisCorrect
                    ? "border-red-500 bg-red-100/70 text-red-800 dark:border-red-600 dark:bg-red-900/40 dark:text-red-300"
                    : "border-sky-200 bg-sky-50/80 text-sky-700 dark:border-sky-800/80 dark:bg-sky-950/60 dark:text-sky-300"
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
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3.5 dark:border-neutral-800/80">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {selectedOption
              ? "Option selected — click Submit to check your answer."
              : "Select an option above, then click Submit."}
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
