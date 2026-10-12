"use client";

import React, { useState } from "react";

export interface FlashcardItem {
  id: string;
  label: string;
  frontTitle?: string;
  frontText: string;
  frontHint?: string;
  backAnswer: string;
  backNote?: string;
}

export interface FlashcardDeckProps {
  cards: FlashcardItem[];
  onShuffle?: () => void;
}

export function FlashcardDeck({ cards, onShuffle }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({});
  const [statusMap, setStatusMap] = useState<
    Record<string, "recalled" | "review">
  >({});

  if (!cards.length) {
    return null;
  }

  const safeIndex = Math.min(currentIndex, cards.length - 1);
  const currentCard = cards[safeIndex];

  const recalledCount = Object.values(statusMap).filter(
    (s) => s === "recalled"
  ).length;
  const reviewCount = Object.values(statusMap).filter(
    (s) => s === "review"
  ).length;

  const handleMark = (id: string, status: "recalled" | "review") => {
    setStatusMap((prev) => ({ ...prev, [id]: status }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200/80 bg-white px-5 py-3.5 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          <span>
            Total Cards:{" "}
            <strong className="text-neutral-900 dark:text-neutral-100">
              {cards.length}
            </strong>
          </span>
          <span className="text-green-700 dark:text-green-400">
            Recalled: <strong>{recalledCount}</strong>
          </span>
          <span className="text-red-700 dark:text-red-400">
            Needs Review: <strong>{reviewCount}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onShuffle && (
            <button
              type="button"
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex(0);
                onShuffle();
              }}
              className="rounded-xl border border-neutral-200/90 bg-neutral-50/70 px-3.5 py-1.5 text-xs font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
            >
              Shuffle Deck
            </button>
          )}
          <button
            type="button"
            onClick={() => setViewAll((v) => !v)}
            className="rounded-xl border border-indigo-600 bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-2xs transition-all hover:bg-indigo-700 dark:border-indigo-500 dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500"
          >
            {viewAll ? "Single Card View" : "Grid View (All Cards)"}
          </button>
        </div>
      </div>

      {!viewAll ? (
        <div className="rounded-2xl border border-t-2 border-neutral-200/80 border-t-indigo-500/80 bg-white p-8 shadow-2xs dark:border-neutral-800/90 dark:border-t-indigo-400/80 dark:bg-neutral-900">
          <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-3.5 dark:border-neutral-800/80">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <span className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400" />
              {currentCard.label} — Card {safeIndex + 1} of {cards.length}
            </span>
            <span
              className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${
                isFlipped
                  ? "border-green-300 bg-green-50 text-green-800 dark:border-green-700/80 dark:bg-green-950/60 dark:text-green-300"
                  : "border-indigo-200/90 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
              }`}
            >
              {isFlipped ? "Back (Answer)" : "Front (Prompt)"}
            </span>
          </div>

          <div
            onClick={() => setIsFlipped((f) => !f)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsFlipped((f) => !f);
              }
            }}
            className="flex min-h-[220px] cursor-pointer flex-col justify-center rounded-2xl border border-indigo-200/70 bg-indigo-50/25 p-8 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/35"
          >
            {!isFlipped ? (
              <div className="space-y-3">
                {currentCard.frontTitle && (
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {currentCard.frontTitle}
                  </p>
                )}
                <p className="text-lg font-medium leading-relaxed text-neutral-900 dark:text-neutral-100">
                  {currentCard.frontText}
                </p>
                {currentCard.frontHint && (
                  <p className="pt-2 text-xs font-medium text-amber-800 dark:text-amber-300">
                    {currentCard.frontHint}
                  </p>
                )}
                <p className="pt-4 text-xs text-indigo-500/80 dark:text-indigo-400/70">
                  Click card to reveal answer
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="mb-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Prompt
                  </p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {currentCard.frontText}
                  </p>
                </div>
                <div className="border-t border-neutral-200/80 pt-4 dark:border-neutral-800">
                  <p className="mb-1 text-xs font-medium text-green-700 dark:text-green-400">
                    Model / Correct Answer
                  </p>
                  <p className="text-lg font-semibold leading-relaxed text-green-900 dark:text-green-300">
                    {currentCard.backAnswer}
                  </p>
                </div>
                {currentCard.backNote && (
                  <div className="border-t border-neutral-200/80 pt-3 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                      Note / Evidence:{" "}
                    </span>
                    {currentCard.backNote}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safeIndex === 0}
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex((i) => Math.max(0, i - 1));
                }}
                className="rounded-xl border border-neutral-200/90 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setIsFlipped((f) => !f)}
                className="rounded-xl border border-indigo-600 bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-2xs transition-all hover:bg-indigo-700 dark:border-indigo-500 dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500"
              >
                {isFlipped ? "Show Prompt" : "Flip Card"}
              </button>
              <button
                type="button"
                disabled={safeIndex === cards.length - 1}
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex((i) => Math.min(cards.length - 1, i + 1));
                }}
                className="rounded-xl border border-neutral-200/90 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
              >
                Next
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMark(currentCard.id, "recalled")}
                className={`rounded-xl border px-4 py-2 text-xs font-medium transition-all ${
                  statusMap[currentCard.id] === "recalled"
                    ? "border-green-400 bg-green-50 font-semibold text-green-900 dark:border-green-600 dark:bg-green-950/60 dark:text-green-300"
                    : "border-neutral-200/90 bg-white text-neutral-700 hover:border-green-400 hover:bg-green-50/40 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-green-600 dark:hover:bg-green-950/30"
                }`}
              >
                Mark Recalled
              </button>
              <button
                type="button"
                onClick={() => handleMark(currentCard.id, "review")}
                className={`rounded-xl border px-4 py-2 text-xs font-medium transition-all ${
                  statusMap[currentCard.id] === "review"
                    ? "border-red-400 bg-red-50 font-semibold text-red-900 dark:border-red-600 dark:bg-red-950/60 dark:text-red-300"
                    : "border-neutral-200/90 bg-white text-neutral-700 hover:border-red-400 hover:bg-red-50/40 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-red-600 dark:hover:bg-red-950/30"
                }`}
              >
                Needs Review
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {cards.map((card) => {
            const flipped = !!flippedMap[card.id];
            const status = statusMap[card.id];
            return (
              <div
                key={card.id}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-2xs dark:bg-neutral-900 ${
                  status === "recalled"
                    ? "border-green-400 dark:border-green-700"
                    : status === "review"
                    ? "border-red-400 dark:border-red-700"
                    : "border-neutral-200/80 dark:border-neutral-800"
                }`}
              >
                <div>
                  <div className="mb-2.5 flex items-center justify-between border-b border-neutral-100 pb-2.5 dark:border-neutral-800/80">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      {card.label}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFlippedMap((prev) => ({
                          ...prev,
                          [card.id]: !prev[card.id],
                        }))
                      }
                      className="rounded-lg border border-neutral-200/90 bg-neutral-50/70 px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition-all hover:border-neutral-400 hover:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
                    >
                      {flipped ? "Hide Answer" : "Reveal Answer"}
                    </button>
                  </div>

                  {card.frontTitle && (
                    <p className="mb-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      {card.frontTitle}
                    </p>
                  )}
                  <p className="text-sm font-medium leading-relaxed text-neutral-900 dark:text-neutral-100">
                    {card.frontText}
                  </p>
                  {card.frontHint && (
                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                      {card.frontHint}
                    </p>
                  )}

                  {flipped && (
                    <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                        {card.backAnswer}
                      </p>
                      {card.backNote && (
                        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                          {card.backNote}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => handleMark(card.id, "recalled")}
                    className={`rounded-lg border px-3 py-1 text-[11px] font-medium transition-all ${
                      status === "recalled"
                        ? "border-green-400 bg-green-50 text-green-800 dark:border-green-600 dark:bg-green-950/60 dark:text-green-300"
                        : "border-neutral-200/80 text-neutral-600 hover:border-green-400 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-green-600"
                    }`}
                  >
                    Recalled
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMark(card.id, "review")}
                    className={`rounded-lg border px-3 py-1 text-[11px] font-medium transition-all ${
                      status === "review"
                        ? "border-red-400 bg-red-50 text-red-800 dark:border-red-600 dark:bg-red-950/60 dark:text-red-300"
                        : "border-neutral-200/80 text-neutral-600 hover:border-red-400 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-red-600"
                    }`}
                  >
                    Needs Review
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
