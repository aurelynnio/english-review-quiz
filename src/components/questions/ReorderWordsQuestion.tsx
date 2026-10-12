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
  const leftBorder = getTopBorderClasses(badgeLabel);
  const headerBand = getHeaderBandClasses(badgeLabel);
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
              {isCorrect ? "✓ Correct" : "✗ Incorrect"}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {preContent && <div className="mb-4">{preContent}</div>}

        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
          <p className="text-sm text-stone-700 dark:text-stone-300">
            <span className="font-mono text-xs font-bold uppercase text-[#1f5c44] dark:text-[#6fd4aa]">
              Clue / Stem:{" "}
            </span>
            <span className="font-medium text-stone-900 dark:text-stone-100">
              {clueText}
            </span>
          </p>
          {keyword && (
            <span className="shrink-0 rounded-md border border-[#e6cda5] bg-[#faf2e3] px-2.5 py-1 font-mono text-xs font-bold text-[#784f12] dark:border-[#63410e] dark:bg-[#2b1f0d] dark:text-[#f2cf94]">
              Keyword: ({keyword})
            </span>
          )}
        </div>

        {/* Assembled Sentence Area */}
        <div className="mb-3.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold tracking-wide uppercase text-stone-500 dark:text-stone-400">
              Assembled Sentence (Click words below to place in order)
            </span>
            {!submitted && selectedTokenIds.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-semibold text-[#1f5c44] underline hover:text-[#143d2d] dark:text-[#6fd4aa] dark:hover:text-[#9ae6c5]"
              >
                Clear All
              </button>
            )}
          </div>

          <div
            className={`flex min-h-[56px] flex-wrap items-center gap-1.5 rounded-xl border p-3 ${
              !submitted
                ? "border-[#b8decb] bg-[#ebf5f0]/45 dark:border-[#1c4d39] dark:bg-[#11281f]/35"
                : isCorrect
                ? "border-emerald-500 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/40"
                : "border-rose-400 bg-rose-50/40 dark:border-rose-700 dark:bg-rose-950/40"
            }`}
          >
            {selectedTokenIds.length === 0 ? (
              <span className="text-xs italic text-stone-400 dark:text-stone-500">
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
                    className={`rounded-lg border px-2.5 py-1 text-sm font-semibold transition-all ${
                      !submitted
                        ? "border-[#1f5c44] bg-[#ebf5f0] text-[#143d2d] shadow-2xs hover:bg-[#d5ebe0] dark:border-[#43a07a] dark:bg-[#1a3b2e] dark:text-[#b2ead1]"
                        : isCorrect
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200"
                        : "border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-200"
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
                className={`rounded-lg border px-3 py-1 text-sm font-medium transition-all ${
                  isUsed
                    ? "cursor-default border-stone-200/60 bg-stone-100/60 text-stone-300 dark:border-stone-800/60 dark:bg-stone-950 dark:text-stone-700"
                    : submitted
                    ? "cursor-default border-stone-200/60 bg-stone-50 text-stone-400 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-600"
                    : "cursor-pointer border-stone-300/90 bg-white text-stone-800 shadow-2xs hover:border-[#1f5c44] hover:bg-[#ebf5f0]/60 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-[#43a07a] dark:hover:bg-[#11281f]/60"
                }`}
              >
                {token.word}
              </button>
            );
          })}
        </div>

        {!submitted && onSubmit && (
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-200/70 pt-4 dark:border-stone-800/80">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {selectedTokenIds.length > 0
                ? `${selectedTokenIds.length} / ${availableTokens.length} words placed — click Submit when ready.`
                : "Click words above to assemble the sentence, then click Submit."}
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
                  Correct Sentence:{" "}
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {targetSentence}
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
        )}
      </div>
    </div>
  );
}
