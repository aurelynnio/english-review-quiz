"use client";

import React from "react";

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
}: MultipleChoiceQuestionProps) {
  const isCorrect = submitted && selectedOption === correctAnswer;
  const isUnanswered = submitted && !selectedOption;

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
            "border-neutral-200/90 bg-neutral-50/40 text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-200 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/50";

          if (!submitted && isSelected) {
            buttonStyle =
              "border-neutral-900 bg-neutral-900 text-white font-medium shadow-2xs dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900";
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
                className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                  !submitted && isSelected
                    ? "border-white/40 bg-white/15 text-white dark:border-neutral-900/30 dark:bg-neutral-900/15 dark:text-neutral-900"
                    : submitted && isThisCorrect
                    ? "border-green-500 bg-green-100/70 text-green-800 dark:border-green-600 dark:bg-green-900/40 dark:text-green-300"
                    : submitted && isSelected && !isThisCorrect
                    ? "border-red-500 bg-red-100/70 text-red-800 dark:border-red-600 dark:bg-red-900/40 dark:text-red-300"
                    : "border-neutral-300/80 bg-white text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
                }`}
              >
                {OPTION_LETTERS[idx] ?? idx + 1}
              </span>
              <span className="leading-snug">{option}</span>
            </button>
          );
        })}
      </div>

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
