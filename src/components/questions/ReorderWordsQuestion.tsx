"use client";

import React from "react";
import { evaluateWritingAnswer } from "@/utils/quizUtils";
import {
  getBadgeClasses,
  getDotClasses,
  getSubmitButtonClasses,
  getTopBorderClasses,
} from "@/utils/themeColors";

export interface WordToken {
  id: string;
  word: string;
}

export interface ReorderWordsQuestionProps {
  indexLabel: string;
  clueText: string;
  keyword?: string;
  targetSentence: string;
  acceptedAnswers?: string[];
  availableTokens: WordToken[];
  selectedTokenIds: string[];
  submitted: boolean;
  note?: string;
  headerBadge?: string;
  preContent?: React.ReactNode;
  onChangeSelectedIds: (ids: string[]) => void;
  onSubmit?: () => void;
  onReset?: () => void;
}

export function ReorderWordsQuestion({
  indexLabel,
  clueText,
  keyword,
  targetSentence,
  acceptedAnswers,
  availableTokens,
  selectedTokenIds,
  submitted,
  note,
  headerBadge,
  preContent,
  onChangeSelectedIds,
  onSubmit,
  onReset,
}: ReorderWordsQuestionProps) {
  const tokenMap = new Map(availableTokens.map((t) => [t.id, t.word]));
  const assembledSentence = selectedTokenIds
    .map((id) => tokenMap.get(id) ?? "")
    .filter(Boolean)
    .join(" ");

  const diffResult = submitted
    ? evaluateWritingAnswer(
        assembledSentence,
        acceptedAnswers && acceptedAnswers.length
          ? acceptedAnswers
          : [targetSentence]
      )
    : null;

  const isCorrect = diffResult?.isExactMatch ?? false;
  const badgeLabel = headerBadge || "Reorder Words";
  const topBorder = getTopBorderClasses(badgeLabel);
  const dotColor = getDotClasses(badgeLabel);
  const badgeColor = getBadgeClasses(badgeLabel);
  const submitBtnClass = getSubmitButtonClasses(badgeLabel);

  const handleAddToken = (id: string) => {
    if (submitted) return;
    if (!selectedTokenIds.includes(id)) {
      onChangeSelectedIds([...selectedTokenIds, id]);
    }
  };

  const handleRemoveToken = (id: string) => {
    if (submitted) return;
    onChangeSelectedIds(selectedTokenIds.filter((item) => item !== id));
  };

  const handleClear = () => {
    if (submitted) return;
    onChangeSelectedIds([]);
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
              {isCorrect ? "Correct" : "Incorrect"}
            </span>
          )}
        </div>
      </div>

      {preContent && <div className="mb-4">{preContent}</div>}

      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          <span className="font-semibold text-teal-700 dark:text-teal-400">
            Clue / Stem:{" "}
          </span>
          {clueText}
        </p>
        {keyword && (
          <span className="shrink-0 rounded-lg border border-amber-300/90 bg-amber-50 px-2.5 py-1 font-mono text-xs font-semibold text-amber-900 dark:border-amber-700/80 dark:bg-amber-950/60 dark:text-amber-200">
            Keyword: ({keyword})
          </span>
        )}
      </div>

      {/* Assembled Sentence Area */}
      <div className="mb-3.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Assembled Sentence (Click words below to place in order)
          </span>
          {!submitted && selectedTokenIds.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-teal-700 underline hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-200"
            >
              Clear All
            </button>
          )}
        </div>

        <div
          className={`flex min-h-[54px] flex-wrap items-center gap-1.5 rounded-xl border p-3 ${
            !submitted
              ? "border-teal-200/80 bg-teal-50/30 dark:border-teal-900/60 dark:bg-teal-950/20"
              : isCorrect
              ? "border-green-400 bg-green-50/50 dark:border-green-700 dark:bg-green-950/40"
              : "border-red-400 bg-red-50/40 dark:border-red-700 dark:bg-red-950/40"
          }`}
        >
          {selectedTokenIds.length === 0 ? (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Click word tiles below to construct the sentence...
            </span>
          ) : (
            selectedTokenIds.map((id) => {
              const word = tokenMap.get(id) ?? "";
              return (
                <button
                  key={id}
                  type="button"
                  disabled={submitted}
                  onClick={() => handleRemoveToken(id)}
                  className={`rounded-lg border px-2.5 py-1 text-sm font-medium transition-all ${
                    !submitted
                      ? "border-teal-400 bg-teal-50 text-teal-950 shadow-2xs hover:bg-teal-100 dark:border-teal-600 dark:bg-teal-900/60 dark:text-teal-100 dark:hover:bg-teal-800/70"
                      : isCorrect
                      ? "border-green-400 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-950/60 dark:text-green-200"
                      : "border-red-400 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950/60 dark:text-red-200"
                  }`}
                >
                  {word}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Shuffled Word Bank */}
      <div className="flex flex-wrap gap-1.5">
        {availableTokens.map((token) => {
          const isUsed = selectedTokenIds.includes(token.id);
          return (
            <button
              key={token.id}
              type="button"
              disabled={submitted || isUsed}
              onClick={() => handleAddToken(token.id)}
              className={`rounded-lg border px-3 py-1 text-sm transition-all ${
                isUsed
                  ? "cursor-default border-neutral-200/60 bg-neutral-100/60 text-neutral-300 dark:border-neutral-800/60 dark:bg-neutral-950 dark:text-neutral-700"
                  : submitted
                  ? "cursor-default border-neutral-200/60 bg-neutral-50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-600"
                  : "cursor-pointer border-neutral-200/90 bg-white text-neutral-800 shadow-2xs hover:border-teal-400 hover:bg-teal-50/50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-teal-600 dark:hover:bg-teal-950/40"
              }`}
            >
              {token.word}
            </button>
          );
        })}
      </div>

      {!submitted && onSubmit && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3.5 dark:border-neutral-800/80">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {selectedTokenIds.length > 0
              ? `${selectedTokenIds.length} / ${availableTokens.length} words placed — click Submit when ready.`
              : "Click words above to assemble the sentence, then click Submit."}
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
                Correct Sentence:{" "}
              </span>
              <span className="font-medium text-green-700 dark:text-green-400">
                {targetSentence}
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
