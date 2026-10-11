"use client";

import React, { useState } from "react";

export interface MatchingPair {
  id: string;
  numberLabel: string;
  leftText: string;
  rightText: string;
  note?: string;
}

export interface MatchingQuestionProps {
  title: string;
  pairs: MatchingPair[];
  shuffledRightOptions: string[];
  userMatches: Record<string, string>; // pair.id -> selected rightText
  submitted: boolean;
  onMatchChange: (pairId: string, rightText: string) => void;
}

export function MatchingQuestion({
  title,
  pairs,
  shuffledRightOptions,
  userMatches,
  submitted,
  onMatchChange,
}: MatchingQuestionProps) {
  const [activeLeftId, setActiveLeftId] = useState<string | null>(
    pairs[0]?.id ?? null
  );

  const handleRightClick = (rightValue: string) => {
    if (submitted || !activeLeftId) return;
    onMatchChange(activeLeftId, rightValue);
    const nextUnmatched = pairs.find(
      (p) => p.id !== activeLeftId && !userMatches[p.id]
    );
    if (nextUnmatched) {
      setActiveLeftId(nextUnmatched.id);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3.5 dark:border-neutral-800/80">
        <div>
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Matching Format
          </span>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h4>
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          Select a prompt on the left, then click its match on the right
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Prompts */}
        <div className="space-y-2.5 lg:col-span-7">
          <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Prompts ({pairs.length})
          </div>
          {pairs.map((pair) => {
            const selectedRight = userMatches[pair.id] || "";
            const isCorrect = submitted && selectedRight === pair.rightText;
            const isActive = !submitted && activeLeftId === pair.id;

            let cardStyle =
              "border-neutral-200/80 bg-neutral-50/40 dark:border-neutral-800 dark:bg-neutral-950/60";
            if (isActive) {
              cardStyle =
                "border-neutral-800 bg-white shadow-xs dark:border-neutral-300 dark:bg-neutral-800/80";
            } else if (submitted) {
              cardStyle = isCorrect
                ? "border-green-400 bg-green-50/50 dark:border-green-700 dark:bg-green-950/40"
                : "border-red-400 bg-red-50/50 dark:border-red-700 dark:bg-red-950/40";
            }

            return (
              <div
                key={pair.id}
                onClick={() => !submitted && setActiveLeftId(pair.id)}
                className={`rounded-xl border p-3.5 transition-all ${cardStyle} ${
                  submitted ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {pair.numberLabel}
                  </span>
                  {submitted && (
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
                        className={`font-medium ${
                          !submitted
                            ? "text-neutral-900 dark:text-neutral-100"
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

                  {!submitted && selectedRight && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMatchChange(pair.id, "");
                      }}
                      className="text-[11px] font-medium text-neutral-500 underline hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {submitted && !isCorrect && (
                  <div className="mt-1.5 text-xs">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      Correct Match:{" "}
                    </span>
                    <span className="font-medium text-green-700 dark:text-green-400">
                      {pair.rightText}
                    </span>
                  </div>
                )}

                {submitted && pair.note && (
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
          <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Answer Choices
          </div>
          {shuffledRightOptions.map((rightOpt, idx) => {
            const usedCount = Object.values(userMatches).filter(
              (v) => v === rightOpt
            ).length;

            return (
              <button
                key={`${rightOpt}-${idx}`}
                type="button"
                disabled={submitted}
                onClick={() => handleRightClick(rightOpt)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left text-sm transition-all ${
                  submitted
                    ? "cursor-default border-neutral-200/70 bg-neutral-50/50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-500"
                    : usedCount > 0
                    ? "border-neutral-400 bg-neutral-100/80 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                    : "border-neutral-200/90 bg-white text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
                }`}
              >
                <span className="leading-snug">{rightOpt}</span>
                {usedCount > 0 && (
                  <span className="shrink-0 rounded-full border border-neutral-300 bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-700 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
                    Assigned ({usedCount})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
