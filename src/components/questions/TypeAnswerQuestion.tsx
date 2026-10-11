"use client";

import React from "react";
import { evaluateWritingAnswer } from "@/utils/quizUtils";

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
  placeholder?: string;
  onChange: (value: string) => void;
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
  placeholder = "Type the transformed sentence...",
  onChange,
}: TypeAnswerQuestionProps) {
  const diffResult = submitted
    ? evaluateWritingAnswer(
        userAnswer,
        acceptedAnswers.length ? acceptedAnswers : [modelAnswer]
      )
    : null;

  const isExact = diffResult?.isExactMatch ?? false;

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
          {submitted && diffResult && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                isExact
                  ? "border-green-300 bg-green-50 text-green-800 dark:border-green-700/80 dark:bg-green-950/60 dark:text-green-300"
                  : "border-red-300 bg-red-50 text-red-800 dark:border-red-700/80 dark:bg-red-950/60 dark:text-red-300"
              }`}
            >
              {isExact
                ? "Correct (100%)"
                : `Word Match: ${diffResult.accuracyPercent}%`}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-baseline">
        <p className="text-[15px] font-medium leading-relaxed text-neutral-900 dark:text-neutral-100">
          {originalSentence}
        </p>
        {keyword && (
          <div className="shrink-0">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Keyword:{" "}
            </span>
            <span className="rounded-lg border border-neutral-200 bg-neutral-100/80 px-2.5 py-1 font-mono text-xs font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
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
          placeholder={placeholder}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all focus:outline-none ${
            !submitted
              ? "border-neutral-200/90 bg-neutral-50/60 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
              : isExact
              ? "border-green-400 bg-green-50/80 font-medium text-green-900 dark:border-green-700 dark:bg-green-950/50 dark:text-green-200"
              : "border-red-400 bg-red-50/40 text-neutral-900 dark:border-red-700 dark:bg-red-950/30 dark:text-neutral-100"
          }`}
        />
      </div>

      {submitted && diffResult && (
        <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4 text-xs dark:border-neutral-800/80">
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-neutral-500 dark:text-neutral-400">
                Word-Level Diff Analysis
              </span>
              <div className="flex flex-wrap gap-3 text-[11px] font-medium">
                <span className="text-green-700 dark:text-green-400">
                  Correct: {diffResult.correctCount}
                </span>
                <span className="text-red-700 dark:text-red-400">
                  Wrong: {diffResult.wrongCount}
                </span>
                <span className="text-red-700 dark:text-red-400">
                  Missing: {diffResult.missingCount}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3.5 text-sm leading-relaxed dark:border-neutral-800 dark:bg-neutral-950/80">
              {diffResult.tokens.map((token, idx) => {
                if (token.type === "correct") {
                  return (
                    <span
                      key={idx}
                      title="Correct word"
                      className="rounded-md border border-green-300 bg-green-50 px-2 py-0.5 font-medium text-green-900 dark:border-green-700/80 dark:bg-green-950/60 dark:text-green-200"
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
                      className="rounded-md border border-red-300 bg-red-50 px-2 py-0.5 text-red-900 line-through dark:border-red-700/80 dark:bg-red-950/60 dark:text-red-200"
                    >
                      {token.text}
                    </span>
                  );
                }
                return (
                  <span
                    key={idx}
                    title="Missing word from model answer"
                    className="rounded-md border border-dashed border-red-400 bg-red-50/60 px-2 py-0.5 text-xs text-red-800 dark:border-red-600 dark:bg-red-950/40 dark:text-red-300"
                  >
                    missing: {token.text}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                Model Answer:{" "}
              </span>
              <span className="font-medium text-green-700 dark:text-green-400">
                {modelAnswer}
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
        </div>
      )}
    </div>
  );
}
