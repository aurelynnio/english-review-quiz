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
    <div className="studio-card overflow-hidden rounded-2xl border border-l-[3px] border-l-[#25416b] dark:border-l-[#6894d4]">
      {/* Tinted Editorial Header Band */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#c5d4e8]/70 bg-gradient-to-r from-[#edf2f8]/90 via-[#edf2f8]/40 to-transparent px-6 py-3.5 dark:border-[#1e3559]/50 dark:from-[#132036]/55 dark:via-[#132036]/20 dark:to-transparent">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[#c5d4e8] bg-[#edf2f8] px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wide uppercase text-[#1b3152] dark:border-[#1e3559] dark:bg-[#132036] dark:text-[#acc4e8]">
            Matching Format
          </span>
          <h4 className="font-display mt-1.5 text-base font-bold text-stone-900 dark:text-stone-100">
            {title}
          </h4>
        </div>
        <span className="text-xs text-stone-500 dark:text-stone-400">
          Select a prompt on the left, click its match on the right, then submit individually or all at once
        </span>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Prompts */}
          <div className="space-y-2.5 lg:col-span-7">
            <div className="font-mono text-[11px] font-bold tracking-wider uppercase text-[#25416b] dark:text-[#acc4e8]">
              Prompts ({pairs.length})
            </div>
            {pairs.map((pair) => {
              const selectedRight = userMatches[pair.id] || "";
              const pairSub = isPairSubmitted(pair.id);
              const isCorrect = pairSub && selectedRight === pair.rightText;
              const isActive = !pairSub && activeLeftId === pair.id;

              let cardStyle =
                "border-stone-200/80 bg-stone-50/50 dark:border-stone-800 dark:bg-stone-900/50";
              if (isActive) {
                cardStyle =
                  "border-[#25416b] bg-[#edf2f8]/70 shadow-xs dark:border-[#6894d4] dark:bg-[#132036]/55";
              } else if (pairSub) {
                cardStyle = isCorrect
                  ? "border-emerald-500 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/40"
                  : "border-rose-400 bg-rose-50/50 dark:border-rose-700 dark:bg-rose-950/40";
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
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#25416b] dark:text-[#acc4e8]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#25416b] dark:bg-[#6894d4]" />
                      {pair.numberLabel}
                    </span>
                    {pairSub && (
                      <span
                        className={`rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase ${
                          isCorrect
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                        }`}
                      >
                        {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                      </span>
                    )}
                  </div>

                  {pair.imageUrl && (
                    <div className="my-2.5 flex justify-center rounded-lg border border-stone-200/80 bg-white p-2.5 dark:border-stone-700 dark:bg-white">
                      <img
                        src={pair.imageUrl}
                        alt={pair.leftText}
                        className="max-h-36 w-auto object-contain"
                      />
                    </div>
                  )}

                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {pair.leftText}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/70 pt-2 text-xs dark:border-stone-800/80">
                    <div>
                      <span className="text-stone-500 dark:text-stone-400">
                        Matched:{" "}
                      </span>
                      {selectedRight ? (
                        <span
                          className={`font-semibold ${
                            !pairSub
                              ? "text-[#b84a27] dark:text-[#f5b8a3]"
                              : isCorrect
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-rose-700 line-through dark:text-rose-400"
                          }`}
                        >
                          {selectedRight}
                        </span>
                      ) : (
                        <span className="italic text-stone-400 dark:text-stone-500">
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
                          className="text-[11px] font-semibold text-[#25416b] underline hover:text-[#1b3152] dark:text-[#acc4e8]"
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
                          className="rounded-lg border border-[#25416b] bg-[#25416b] px-2.5 py-1 text-[11px] font-semibold text-white transition-all hover:bg-[#1b3152] dark:border-[#527bb8] dark:bg-[#527bb8] dark:text-stone-950"
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
                          className="rounded-lg border border-stone-300/90 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 transition-all hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                        >
                          Try Again
                        </button>
                      )}
                    </div>
                  </div>

                  {pairSub && !isCorrect && (
                    <div className="mt-1.5 text-xs">
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        Correct Match:{" "}
                      </span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {pair.rightText}
                      </span>
                    </div>
                  )}

                  {pairSub && pair.note && (
                    <div className="mt-1 text-xs text-stone-600 dark:text-stone-400">
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
            <div className="font-mono text-[11px] font-bold tracking-wider uppercase text-[#b84a27] dark:text-[#f5b8a3]">
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
                      ? "cursor-default border-stone-200/70 bg-stone-50/50 text-stone-500 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-500"
                      : usedCount > 0
                      ? "border-[#b84a27] bg-[#f9ece7]/80 text-[#6c2711] font-medium dark:border-[#e2724d] dark:bg-[#2e1913]/65 dark:text-[#f5b8a3]"
                      : "border-stone-200/90 bg-white text-stone-800 hover:border-[#25416b] hover:bg-[#edf2f8]/45 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-[#6894d4] dark:hover:bg-[#132036]/40"
                  }`}
                >
                  <span className="leading-snug">{rightOpt}</span>
                  {usedCount > 0 && (
                    <span className="shrink-0 rounded-md border border-[#efb9a6] bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-[#94381b] dark:border-[#782b12] dark:bg-stone-900 dark:text-[#f5b8a3]">
                      Assigned ({usedCount})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {(onSubmitSet || onResetSet) && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200/70 pt-4 dark:border-stone-800/80">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {allPairsSubmitted
                ? "All pairs in this matching set have been submitted."
                : "You can submit each matched prompt individually above, or submit the entire matching set at once."}
            </span>
            <div className="flex items-center gap-2">
              {!allPairsSubmitted && onSubmitSet && (
                <button
                  type="button"
                  onClick={onSubmitSet}
                  className="rounded-xl border border-[#25416b] bg-[#25416b] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-[#1b3152] dark:border-[#527bb8] dark:bg-[#527bb8] dark:text-stone-950"
                >
                  Submit Matching Set
                </button>
              )}
              {allPairsSubmitted && onResetSet && (
                <button
                  type="button"
                  onClick={onResetSet}
                  className="rounded-xl border border-stone-300/90 bg-stone-100/80 px-3.5 py-1.5 text-xs font-semibold text-stone-700 transition-all hover:border-stone-400 hover:bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                >
                  Try Matching Set Again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
