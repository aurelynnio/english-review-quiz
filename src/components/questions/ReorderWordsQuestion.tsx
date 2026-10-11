"use client";

import React from "react";
import { evaluateWritingAnswer } from "@/utils/quizUtils";

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
  onChangeSelectedIds: (ids: string[]) => void;
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
  onChangeSelectedIds,
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
              {isCorrect ? "Correct" : "Incorrect"}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            Clue / Stem:{" "}
          </span>
          {clueText}
        </p>
        {keyword && (
          <span className="shrink-0 rounded-lg border border-neutral-200 bg-neutral-100/80 px-2.5 py-1 font-mono text-xs font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
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
              className="text-xs font-medium text-neutral-500 underline hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Clear All
            </button>
          )}
        </div>

        <div
          className={`flex min-h-[54px] flex-wrap items-center gap-1.5 rounded-xl border p-3 ${
            !submitted
              ? "border-neutral-200/90 bg-neutral-50/70 dark:border-neutral-800 dark:bg-neutral-950/70"
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
                      ? "border-neutral-300 bg-white text-neutral-900 shadow-2xs hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
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
                  : "cursor-pointer border-neutral-200/90 bg-white text-neutral-800 shadow-2xs hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
              }`}
            >
              {token.word}
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className="mt-4 border-t border-neutral-100 pt-3.5 text-xs text-neutral-700 dark:border-neutral-800/80 dark:text-neutral-300">
          <div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              Correct Sentence:{" "}
            </span>
            <span className="font-medium text-green-700 dark:text-green-400">
              {targetSentence}
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
