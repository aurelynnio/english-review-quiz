"use client";

import React, { useState } from "react";

export interface FlashcardItem {
  id: string;
  label: string;
  frontTitle?: string;
  frontText: string;
  frontHint?: string;
  imageUrl?: string;
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
      <div className="studio-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-4 font-mono text-xs font-medium text-stone-600 dark:text-stone-400">
          <span>
            Total Cards:{" "}
            <strong className="text-stone-900 dark:text-stone-100">
              {cards.length}
            </strong>
          </span>
          <span className="text-emerald-700 dark:text-emerald-400">
            Recalled: <strong>{recalledCount}</strong>
          </span>
          <span className="text-rose-700 dark:text-rose-400">
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
              className="rounded-xl border border-stone-300/90 bg-stone-50/70 px-3.5 py-1.5 text-xs font-semibold text-stone-700 transition-all hover:border-stone-400 hover:bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-stone-500"
            >
              Shuffle Deck
            </button>
          )}
          <button
            type="button"
            onClick={() => setViewAll((v) => !v)}
            className="rounded-xl border border-[#b84a27] bg-[#b84a27] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-[#94381b] dark:border-[#e2724d] dark:bg-[#d4603b] dark:text-white"
          >
            {viewAll ? "Single Card View" : "Grid View (All Cards)"}
          </button>
        </div>
      </div>

      {!viewAll ? (
        <div className="studio-card overflow-hidden rounded-2xl border border-l-[3px] border-l-[#b84a27] dark:border-l-[#e2724d]">
          <div className="flex items-center justify-between border-b border-[#efb9a6]/60 bg-gradient-to-r from-[#f9ece7]/80 via-[#f9ece7]/30 to-transparent px-6 py-3.5 dark:border-[#782b12]/50 dark:from-[#2e1913]/55 dark:via-[#2e1913]/20 dark:to-transparent">
            <span className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#94381b] dark:text-[#f5b8a3]">
              <span className="h-2 w-2 rounded-full bg-[#b84a27] dark:bg-[#e2724d]" />
              {currentCard.label} — Card {safeIndex + 1} of {cards.length}
            </span>
            <span
              className={`rounded-md border px-3 py-0.5 font-mono text-[11px] font-bold uppercase ${
                isFlipped
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "border-[#efb9a6] bg-[#f9ece7] text-[#94381b] dark:border-[#782b12] dark:bg-[#2e1913] dark:text-[#f5b8a3]"
              }`}
            >
              {isFlipped ? "Back (Answer)" : "Front (Prompt)"}
            </span>
          </div>

          <div className="p-6 sm:p-8">
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
              className="studio-subcard flex min-h-[230px] cursor-pointer flex-col justify-center rounded-2xl border p-8 text-left transition-all hover:border-[#b84a27]/60 dark:hover:border-[#e2724d]/60"
            >
              {currentCard.imageUrl && (
                <div className="mb-4 flex justify-center rounded-xl border border-stone-200/80 bg-white p-3 dark:border-stone-700 dark:bg-white">
                  <img
                    src={currentCard.imageUrl}
                    alt={currentCard.frontText}
                    className="max-h-48 w-auto object-contain"
                  />
                </div>
              )}
              {!isFlipped ? (
                <div className="space-y-3">
                  {currentCard.frontTitle && (
                    <p className="font-mono text-xs font-bold tracking-wider uppercase text-[#b84a27] dark:text-[#e2724d]">
                      {currentCard.frontTitle}
                    </p>
                  )}
                  <p className="font-display text-xl font-bold leading-relaxed text-stone-900 dark:text-stone-100">
                    {currentCard.frontText}
                  </p>
                  {currentCard.frontHint && (
                    <p className="pt-2 font-mono text-xs font-semibold text-[#784f12] dark:text-[#f2cf94]">
                      {currentCard.frontHint}
                    </p>
                  )}
                  <p className="pt-4 font-mono text-[11px] tracking-wide uppercase text-stone-400 dark:text-stone-500">
                    Click card to flip & reveal answer →
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="mb-1 font-mono text-[11px] font-bold uppercase text-stone-500 dark:text-stone-400">
                      Prompt
                    </p>
                    <p className="text-sm text-stone-700 dark:text-stone-300">
                      {currentCard.frontText}
                    </p>
                  </div>
                  <div className="border-t border-stone-200/80 pt-4 dark:border-stone-800">
                    <p className="mb-1 font-mono text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                      Model / Correct Answer
                    </p>
                    <p className="font-display text-xl font-bold leading-relaxed text-emerald-900 dark:text-emerald-300">
                      {currentCard.backAnswer}
                    </p>
                  </div>
                  {currentCard.backNote && (
                    <div className="border-t border-stone-200/80 pt-3 text-xs text-stone-600 dark:border-stone-800 dark:text-stone-400">
                      <span className="font-semibold text-stone-900 dark:text-stone-200">
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
                  className="rounded-xl border border-stone-300/90 bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition-all hover:border-stone-400 disabled:opacity-40 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setIsFlipped((f) => !f)}
                  className="rounded-xl border border-[#b84a27] bg-[#b84a27] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-[#94381b] dark:border-[#e2724d] dark:bg-[#d4603b] dark:text-white"
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
                  className="rounded-xl border border-stone-300/90 bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition-all hover:border-stone-400 disabled:opacity-40 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
                >
                  Next
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMark(currentCard.id, "recalled")}
                  className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                    statusMap[currentCard.id] === "recalled"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "border-stone-300/90 bg-white text-stone-700 hover:border-emerald-500 hover:bg-emerald-50/40 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300"
                  }`}
                >
                  Mark Recalled
                </button>
                <button
                  type="button"
                  onClick={() => handleMark(currentCard.id, "review")}
                  className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                    statusMap[currentCard.id] === "review"
                      ? "border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-600 dark:bg-rose-950/60 dark:text-rose-300"
                      : "border-stone-300/90 bg-white text-stone-700 hover:border-rose-400 hover:bg-rose-50/40 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300"
                  }`}
                >
                  Needs Review
                </button>
              </div>
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
                className={`studio-card flex flex-col justify-between rounded-2xl border p-5 ${
                  status === "recalled"
                    ? "border-emerald-500 dark:border-emerald-700"
                    : status === "review"
                    ? "border-rose-400 dark:border-rose-700"
                    : ""
                }`}
              >
                <div>
                  <div className="mb-2.5 flex items-center justify-between border-b border-stone-200/70 pb-2.5 dark:border-stone-800/80">
                    <span className="font-mono text-xs font-bold text-stone-500 dark:text-stone-400">
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
                      className="rounded-lg border border-stone-300/90 bg-stone-50/70 px-2.5 py-1 text-[11px] font-semibold text-stone-700 transition-all hover:border-stone-400 hover:bg-white dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300"
                    >
                      {flipped ? "Hide Answer" : "Reveal Answer"}
                    </button>
                  </div>

                  {card.imageUrl && (
                    <div className="mb-3 flex justify-center rounded-lg border border-stone-200/80 bg-white p-2.5 dark:border-stone-700 dark:bg-white">
                      <img
                        src={card.imageUrl}
                        alt={card.frontText}
                        className="max-h-36 w-auto object-contain"
                      />
                    </div>
                  )}

                  {card.frontTitle && (
                    <p className="mb-1 font-mono text-[11px] font-bold uppercase text-[#b84a27] dark:text-[#e2724d]">
                      {card.frontTitle}
                    </p>
                  )}
                  <p className="text-sm font-semibold leading-relaxed text-stone-900 dark:text-stone-100">
                    {card.frontText}
                  </p>
                  {card.frontHint && (
                    <p className="mt-1 font-mono text-xs text-[#784f12] dark:text-[#f2cf94]">
                      {card.frontHint}
                    </p>
                  )}

                  {flipped && (
                    <div className="mt-4 border-t border-stone-200/70 pt-3 dark:border-stone-800">
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        {card.backAnswer}
                      </p>
                      {card.backNote && (
                        <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                          {card.backNote}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-stone-200/70 pt-3 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => handleMark(card.id, "recalled")}
                    className={`rounded-lg border px-3 py-1 text-[11px] font-semibold transition-all ${
                      status === "recalled"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "border-stone-300/80 text-stone-600 hover:border-emerald-500 dark:border-stone-700 dark:text-stone-400"
                    }`}
                  >
                    Recalled
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMark(card.id, "review")}
                    className={`rounded-lg border px-3 py-1 text-[11px] font-semibold transition-all ${
                      status === "review"
                        ? "border-rose-400 bg-rose-50 text-rose-800 dark:border-rose-600 dark:bg-rose-950/60 dark:text-rose-300"
                        : "border-stone-300/80 text-stone-600 hover:border-rose-400 dark:border-stone-700 dark:text-stone-400"
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
