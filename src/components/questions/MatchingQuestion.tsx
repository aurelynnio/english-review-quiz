"use client";

import React, { useState } from "react";

export interface MatchingPair {
  id: string;
  numberLabel: string;
  leftText: string;
  rightText: string;
  imageUrl?: string;
  note?: string;
}

export interface MatchingQuestionProps {
  title: string;
  pairs: MatchingPair[];
  shuffledRightOptions: string[];
  userMatches: Record<string, string>; // pair.id -> selected rightText
  submitted: boolean;
  submittedMap?: Record<string, boolean>;
  onMatchChange: (pairId: string, rightText: string) => void;
  onSubmitPair?: (pairId: string) => void;
  onResetPair?: (pairId: string) => void;
  onSubmitSet?: () => void;
  onResetSet?: () => void;
}

export function MatchingQuestion({
  title,
  pairs,
  shuffledRightOptions,
  userMatches,
  submitted,
  submittedMap,
  onMatchChange,
  onSubmitPair,
  onResetPair,
  onSubmitSet,
  onResetSet,
}: MatchingQuestionProps) {
  const [activeLeftId, setActiveLeftId] = useState<string | null>(
    pairs[0]?.id ?? null
  );

  const isPairSubmitted = (pairId: string) =>
    submitted || Boolean(submittedMap?.[pairId]);

  const allPairsSubmitted =
    submitted || pairs.every((p) => isPairSubmitted(p.id));

  const handleRightClick = (rightValue: string) => {
    if (!activeLeftId || isPairSubmitted(activeLeftId)) return;
    onMatchChange(activeLeftId, rightValue);
    const nextUnmatched = pairs.find(
      (p) =>
        p.id !== activeLeftId &&
        !isPairSubmitted(p.id) &&
        !userMatches[p.id]
    );
    if (nextUnmatched) {
      setActiveLeftId(nextUnmatched.id);
    }
  };

  return (
    <div className="rounded-2xl border border-t-2 border-neutral-200/80 border-t-cyan-500/80 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:border-t-cyan-400/80 dark:bg-neutral-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3.5 dark:border-neutral-800/80">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/90 bg-cyan-50/90 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-700 dark:border-cyan-800/80 dark:bg-cyan-950/60 dark:text-cyan-300">
            Matching Format
          </span>
          <h4 className="mt-1.5 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h4>
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          Select a prompt on the left, click its match on the right, then submit individually or all at once
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Prompts */}
        <div className="space-y-2.5 lg:col-span-7">
          <div className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">
            Prompts ({pairs.length})
          </div>
          {pairs.map((pair) => {
            const selectedRight = userMatches[pair.id] || "";
            const pairSub = isPairSubmitted(pair.id);
            const isCorrect = pairSub && selectedRight === pair.rightText;
            const isActive = !pairSub && activeLeftId === pair.id;

            let cardStyle =
              "border-neutral-200/80 bg-neutral-50/40 dark:border-neutral-800 dark:bg-neutral-950/60";
            if (isActive) {
              cardStyle =
                "border-cyan-500 bg-cyan-50/60 shadow-xs dark:border-cyan-400 dark:bg-cyan-950/40";
            } else if (pairSub) {
              cardStyle = isCorrect
                ? "border-green-400 bg-green-50/50 dark:border-green-700 dark:bg-green-950/40"
                : "border-red-400 bg-red-50/50 dark:border-red-700 dark:bg-red-950/40";
            }

            return (
              <div
                key={pair.id}
                onClick={() => !pairSub && setActiveLeftId(pair.id)}
                className={`rounded-xl border p-3.5 transition-all ${cardStyle} ${
                  pairSub ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400" />
                    {pair.numberLabel}
                  </span>
                  {pairSub && (
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        isCorrect
                          ? "border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950/60 dark:text-green-300"
                          : "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/60 dark:text-red-300"
                      }`}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  )}
                </div>

                {pair.imageUrl && (
                  <div className="my-2.5 flex justify-center rounded-lg border border-neutral-200/80 bg-white p-2.5 dark:border-neutral-700 dark:bg-white">
                    <img
                      src={pair.imageUrl}
                      alt={pair.leftText}
                      className="max-h-36 w-auto object-contain"
                    />
                  </div>
                )}

                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {pair.leftText}
                </p>

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-2 text-xs dark:border-neutral-800/80">
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Matched:{" "}
                    </span>
                    {selectedRight ? (
                      <span
                        className={`font-semibold ${
                          !pairSub
                            ? "text-indigo-700 dark:text-indigo-300"
                            : isCorrect
                            ? "text-green-700 dark:text-green-400"
                            : "text-red-700 line-through dark:text-red-400"
                        }`}
                      >
                        {selectedRight}
                      </span>
                    ) : (
                      <span className="italic text-neutral-400 dark:text-neutral-500">
                        None selected
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!pairSub && selectedRight && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMatchChange(pair.id, "");
                        }}
                        className="text-[11px] font-medium text-cyan-700 underline hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-200"
                      >
                        Clear
                      </button>
                    )}
                    {!pairSub && onSubmitPair && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSubmitPair(pair.id);
                        }}
                        className="rounded-lg border border-cyan-600 bg-cyan-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-all hover:bg-cyan-700 dark:border-cyan-500 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
                      >
                        Submit Answer
                      </button>
                    )}
                    {pairSub && onResetPair && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onResetPair(pair.id);
                        }}
                        className="rounded-lg border border-neutral-200/90 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition-all hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-500"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </div>

                {pairSub && !isCorrect && (
                  <div className="mt-1.5 text-xs">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      Correct Match:{" "}
                    </span>
                    <span className="font-medium text-green-700 dark:text-green-400">
                      {pair.rightText}
                    </span>
                  </div>
                )}

                {pairSub && pair.note && (
                  <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                    <span className="font-semibold">Note: </span>
                    {pair.note}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Options to Match */}
        <div className="space-y-2.5 lg:col-span-5">
          <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
            Answer Choices
          </div>
          {shuffledRightOptions.map((rightOpt, idx) => {
            const usedCount = pairs.filter(
              (p) => userMatches[p.id] === rightOpt
            ).length;

            return (
              <button
                key={`${rightOpt}-${idx}`}
                type="button"
                disabled={allPairsSubmitted}
                onClick={() => handleRightClick(rightOpt)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left text-sm transition-all ${
                  allPairsSubmitted
                    ? "cursor-default border-neutral-200/70 bg-neutral-50/50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-500"
                    : usedCount > 0
                    ? "border-indigo-400 bg-indigo-50/70 text-indigo-950 dark:border-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-100"
                    : "border-neutral-200/90 bg-white text-neutral-800 hover:border-cyan-400 hover:bg-cyan-50/40 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-cyan-600 dark:hover:bg-cyan-950/40"
                }`}
              >
                <span className="leading-snug">{rightOpt}</span>
                {usedCount > 0 && (
                  <span className="shrink-0 rounded-full border border-indigo-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:border-indigo-600 dark:bg-indigo-900 dark:text-indigo-200">
                    Assigned ({usedCount})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {(onSubmitSet || onResetSet) && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800/80">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {allPairsSubmitted
              ? "All pairs in this matching set have been submitted."
              : "You can submit each matched prompt individually above, or submit the entire matching set at once."}
          </span>
          <div className="flex items-center gap-2">
            {!allPairsSubmitted && onSubmitSet && (
              <button
                type="button"
                onClick={onSubmitSet}
                className="rounded-xl border border-cyan-600 bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-cyan-700 dark:border-cyan-500 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400"
              >
                Submit Matching Set
              </button>
            )}
            {allPairsSubmitted && onResetSet && (
              <button
                type="button"
                onClick={onResetSet}
                className="rounded-xl border border-neutral-200/90 bg-neutral-50/80 px-3.5 py-1.5 text-xs font-medium text-neutral-700 transition-all hover:border-neutral-400 hover:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
              >
                Try Matching Set Again
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
