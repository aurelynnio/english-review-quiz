"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SIGNS_QUESTIONS, SignQuestion } from "@/data/questions";
import {
  seededShuffle,
  tokenizeWords,
  evaluateWritingAnswer,
} from "@/utils/quizUtils";
import { MultipleChoiceQuestion } from "@/components/questions/MultipleChoiceQuestion";
import { TrueFalseQuestion } from "@/components/questions/TrueFalseQuestion";
import { TypeAnswerQuestion } from "@/components/questions/TypeAnswerQuestion";
import {
  ReorderWordsQuestion,
  WordToken,
} from "@/components/questions/ReorderWordsQuestion";
import {
  MatchingQuestion,
  MatchingPair,
} from "@/components/questions/MatchingQuestion";
import {
  FlashcardDeck,
  FlashcardItem,
} from "@/components/questions/FlashcardDeck";

type SignsMode =
  | "multiple-choice"
  | "mixed"
  | "true-false"
  | "matching"
  | "reorder-words"
  | "type-the-answer"
  | "flashcard";

const SIGN_PLAQUE_PALETTES = [
  {
    wrapper:
      "border-amber-300/90 border-l-4 border-l-amber-500 bg-amber-50/50 dark:border-amber-800/70 dark:border-l-amber-400 dark:bg-amber-950/25",
    headerBorder: "border-amber-200/70 dark:border-amber-800/50",
    badge:
      "bg-amber-100/90 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  },
  {
    wrapper:
      "border-sky-300/90 border-l-4 border-l-sky-500 bg-sky-50/50 dark:border-sky-800/70 dark:border-l-sky-400 dark:bg-sky-950/25",
    headerBorder: "border-sky-200/70 dark:border-sky-800/50",
    badge: "bg-sky-100/90 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300",
  },
  {
    wrapper:
      "border-teal-300/90 border-l-4 border-l-teal-500 bg-teal-50/50 dark:border-teal-800/70 dark:border-l-teal-400 dark:bg-teal-950/25",
    headerBorder: "border-teal-200/70 dark:border-teal-800/50",
    badge:
      "bg-teal-100/90 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300",
  },
  {
    wrapper:
      "border-violet-300/90 border-l-4 border-l-violet-500 bg-violet-50/50 dark:border-violet-800/70 dark:border-l-violet-400 dark:bg-violet-950/25",
    headerBorder: "border-violet-200/70 dark:border-violet-800/50",
    badge:
      "bg-violet-100/90 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300",
  },
  {
    wrapper:
      "border-rose-300/90 border-l-4 border-l-rose-500 bg-rose-50/50 dark:border-rose-800/70 dark:border-l-rose-400 dark:bg-rose-950/25",
    headerBorder: "border-rose-200/70 dark:border-rose-800/50",
    badge:
      "bg-rose-100/90 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
  },
];

function SignPlaque({ sign }: { sign: SignQuestion }) {
  const palette =
    SIGN_PLAQUE_PALETTES[(sign.number - 1) % SIGN_PLAQUE_PALETTES.length];
  return (
    <div className={`rounded-xl border p-4 ${palette.wrapper}`}>
      <div
        className={`flex items-center justify-between border-b pb-2 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 ${palette.headerBorder}`}
      >
        <span
          className={`rounded-md px-2 py-0.5 font-semibold ${palette.badge}`}
        >
          Notice / Sign #{sign.number}
        </span>
        <span className="font-mono">{sign.imageFile}</span>
      </div>
      <div className="mt-3 flex flex-col items-center gap-3">
        <div className="flex w-full max-w-md justify-center rounded-xl border border-neutral-200/80 bg-white p-3.5 shadow-2xs dark:border-neutral-700 dark:bg-white">
          <img
            src={`/${sign.imageFile}`}
            alt={sign.title}
            className="max-h-52 w-auto object-contain"
          />
        </div>
        <div className="text-center text-sm font-semibold tracking-wide text-neutral-900 dark:text-neutral-100">
          {sign.signText}
        </div>
      </div>
    </div>
  );
}

export function SignsSection({
  globalReviewMode,
}: {
  globalReviewMode: boolean;
}) {
  const [seed, setSeed] = useState<number>(404);
  const [mode, setMode] = useState<SignsMode>("multiple-choice");
  const [submittedIds, setSubmittedIds] = useState<Record<string, boolean>>({});

  const [mcSelections, setMcSelections] = useState<Record<string, string>>({});
  const [tfSelections, setTfSelections] = useState<Record<string, boolean>>({});
  const [typedAnswers, setTypedAnswers] = useState<Record<string, string>>({});
  const [reorderedIds, setReorderedIds] = useState<Record<string, string[]>>(
    {}
  );
  const [matches, setMatches] = useState<Record<string, string>>({});

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 100000) + 1);
  }, []);

  const activeMode: SignsMode = globalReviewMode ? "flashcard" : mode;

  const randomizedSigns = useMemo(
    () => seededShuffle(SIGNS_QUESTIONS, seed),
    [seed]
  );

  const shuffledOptionsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    randomizedSigns.forEach((s, idx) => {
      map[s.id] = seededShuffle(s.options, seed + idx * 19 + 3);
    });
    return map;
  }, [randomizedSigns, seed]);

  const tfStatementsMap = useMemo(() => {
    const map: Record<string, { statement: string; isTrue: boolean }> = {};
    randomizedSigns.forEach((s, idx) => {
      const isTrue = (seed + idx) % 2 === 0;
      const wrongOpts = s.options.filter((o) => o !== s.correctAnswer);
      const chosen = isTrue
        ? s.correctAnswer
        : seededShuffle(wrongOpts, seed + idx * 29)[0] ?? s.correctAnswer;
      map[s.id] = {
        statement: `${s.title} — Meaning: "${chosen}"`,
        isTrue,
      };
    });
    return map;
  }, [randomizedSigns, seed]);

  const reorderTokensMap = useMemo(() => {
    const map: Record<string, WordToken[]> = {};
    randomizedSigns.forEach((s, idx) => {
      const words = tokenizeWords(s.correctAnswer);
      const tokens = words.map((w, wIdx) => ({
        id: `${s.id}-tok-${wIdx}`,
        word: w,
      }));
      map[s.id] = seededShuffle(tokens, seed + idx * 37);
    });
    return map;
  }, [randomizedSigns, seed]);

  const matchingPairs: MatchingPair[] = useMemo(
    () =>
      randomizedSigns.map((s) => ({
        id: s.id,
        numberLabel: `Sign ${s.number}`,
        leftText: s.title,
        rightText: s.correctAnswer,
        imageUrl: `/${s.imageFile}`,
      })),
    [randomizedSigns]
  );

  const shuffledMatchingRight = useMemo(
    () =>
      seededShuffle(
        matchingPairs.map((p) => p.rightText),
        seed + 777
      ),
    [matchingPairs, seed]
  );

  const flashcards: FlashcardItem[] = useMemo(
    () =>
      randomizedSigns.map((s) => ({
        id: s.id,
        label: `Sign #${s.number}`,
        frontTitle: `Sign & Notice (${s.imageFile})`,
        frontText: s.title,
        frontHint: `Options: ${(shuffledOptionsMap[s.id] || s.options).join(
          " | "
        )}`,
        imageUrl: `/${s.imageFile}`,
        backAnswer: s.correctAnswer,
      })),
    [randomizedSigns, shuffledOptionsMap]
  );

  const getMixedFormat = (idx: number): SignsMode => {
    const cycle: SignsMode[] = [
      "multiple-choice",
      "true-false",
      "reorder-words",
      "type-the-answer",
    ];
    return cycle[idx % cycle.length];
  };

  const evaluateSignItem = (s: SignQuestion, fmt: SignsMode): boolean => {
    if (fmt === "multiple-choice") {
      return mcSelections[s.id] === s.correctAnswer;
    }
    if (fmt === "true-false") {
      const tf = tfStatementsMap[s.id];
      return !!tf && tfSelections[s.id] === tf.isTrue;
    }
    if (fmt === "reorder-words") {
      const tokens = reorderTokensMap[s.id] || [];
      const tokenMap = new Map(tokens.map((t) => [t.id, t.word]));
      const assembled = (reorderedIds[s.id] || [])
        .map((id) => tokenMap.get(id) ?? "")
        .join(" ");
      return evaluateWritingAnswer(assembled, [s.correctAnswer]).isExactMatch;
    }
    if (fmt === "type-the-answer") {
      return evaluateWritingAnswer(typedAnswers[s.id] || "", [s.correctAnswer])
        .isExactMatch;
    }
    if (fmt === "matching") {
      return matches[s.id] === s.correctAnswer;
    }
    return false;
  };

  const scoreSummary = useMemo(() => {
    let submittedCount = 0;
    let correct = 0;

    if (activeMode !== "flashcard") {
      randomizedSigns.forEach((s, idx) => {
        if (submittedIds[s.id]) {
          submittedCount++;
          const fmt =
            activeMode === "mixed" ? getMixedFormat(idx) : activeMode;
          if (evaluateSignItem(s, fmt)) correct++;
        }
      });
    }

    return {
      correct,
      submittedCount,
      total: randomizedSigns.length,
    };
  }, [
    submittedIds,
    activeMode,
    randomizedSigns,
    mcSelections,
    tfSelections,
    reorderedIds,
    typedAnswers,
    matches,
  ]);

  const allSubmitted =
    randomizedSigns.length > 0 &&
    scoreSummary.submittedCount === randomizedSigns.length;

  const handleSubmitOne = (id: string) => {
    setSubmittedIds((prev) => ({ ...prev, [id]: true }));
  };

  const handleResetOne = (id: string) => {
    setSubmittedIds((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSubmitAll = () => {
    const next: Record<string, boolean> = {};
    randomizedSigns.forEach((s) => {
      next[s.id] = true;
    });
    setSubmittedIds(next);
  };

  const handleRetry = () => {
    setSubmittedIds({});
    setMcSelections({});
    setTfSelections({});
    setTypedAnswers({});
    setReorderedIds({});
    setMatches({});
    setSeed(Math.floor(Math.random() * 100000) + 1);
  };

  return (
    <section className="space-y-6">
      <div className="studio-card overflow-hidden rounded-2xl border border-l-4 border-l-[#a36c1d] dark:border-l-[#e0a84e]">
        <div className="border-b border-[#e6cda5]/70 bg-gradient-to-r from-[#faf2e3]/90 via-[#faf2e3]/35 to-transparent px-6 py-5 dark:border-[#63410e]/50 dark:from-[#2b1f0d]/60 dark:via-[#2b1f0d]/20 dark:to-transparent">
          <div className="flex flex-col justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-md border border-[#e6cda5] bg-[#faf2e3] px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase text-[#784f12] dark:border-[#63410e] dark:bg-[#2b1f0d] dark:text-[#f2cf94]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#a36c1d] dark:bg-[#e0a84e]" />
                Sec 04 • Signs 1–10
              </span>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                4. Reading — Signs & Notices
              </h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Read each sign or notice carefully and submit each question
                individually for immediate feedback.
              </p>
            </div>

            <div className="studio-subcard flex flex-wrap items-center gap-1 rounded-xl border p-1">
              {(
                [
                  { id: "multiple-choice", label: "Multiple Choice" },
                  { id: "mixed", label: "Mixed Formats" },
                  { id: "true-false", label: "True / False" },
                  { id: "matching", label: "Matching" },
                  { id: "reorder-words", label: "Reorder Words" },
                  { id: "type-the-answer", label: "Type the Answer" },
                  { id: "flashcard", label: "Flashcards" },
                ] as { id: SignsMode; label: string }[]
              ).map((tab) => {
                const isSelected = activeMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setMode(tab.id);
                      setSubmittedIds({});
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#a36c1d] text-white shadow-2xs dark:bg-[#e0a84e] dark:text-stone-950"
                        : "text-stone-600 hover:bg-white/70 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800/70"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {activeMode !== "flashcard" && (
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5">
            <div className="flex flex-wrap items-center gap-5 text-sm">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
                  Progress
                </span>
                <div className="h-2 w-28 overflow-hidden rounded-full bg-stone-200/90 dark:bg-stone-800">
                  <div
                    className="h-full rounded-full bg-[#a36c1d] transition-all duration-300 dark:bg-[#e0a84e]"
                    style={{
                      width: `${
                        scoreSummary.total > 0
                          ? Math.round(
                              (scoreSummary.submittedCount /
                                scoreSummary.total) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="font-mono text-xs font-bold text-[#784f12] dark:text-[#f2cf94]">
                  {scoreSummary.submittedCount}/{scoreSummary.total}
                </span>
              </div>
              {scoreSummary.submittedCount > 0 && (
                <div className="flex items-center gap-2 border-l border-stone-200 pl-4 dark:border-stone-800">
                  <span className="font-mono text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
                    Accuracy:
                  </span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      scoreSummary.correct === scoreSummary.submittedCount
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-[#784f12] dark:text-[#f2cf94]"
                    }`}
                  >
                    {scoreSummary.correct} / {scoreSummary.submittedCount} (
                    {Math.round(
                      (scoreSummary.correct / scoreSummary.submittedCount) * 100
                    )}
                    %)
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!allSubmitted && (
                <button
                  type="button"
                  onClick={handleSubmitAll}
                  className="rounded-xl border border-[#e6cda5] bg-[#faf2e3]/80 px-3.5 py-1.5 text-xs font-semibold text-[#784f12] transition-all hover:bg-[#a36c1d] hover:text-white dark:border-[#63410e] dark:bg-[#2b1f0d] dark:text-[#f2cf94] dark:hover:bg-[#e0a84e] dark:hover:text-stone-950"
                >
                  Submit All Remaining
                </button>
              )}
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-xl border border-[#a36c1d] bg-[#a36c1d] px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#825414] dark:border-[#e0a84e] dark:bg-[#e0a84e] dark:text-stone-950"
              >
                Reset & Randomize
              </button>
            </div>
          </div>
        )}
      </div>

      {activeMode === "flashcard" ? (
        <FlashcardDeck
          cards={flashcards}
          onShuffle={() => setSeed(Math.floor(Math.random() * 100000) + 1)}
        />
      ) : activeMode === "matching" ? (
        <MatchingQuestion
          title="Match each Sign / Notice with its correct meaning"
          pairs={matchingPairs}
          shuffledRightOptions={shuffledMatchingRight}
          userMatches={matches}
          submitted={allSubmitted}
          submittedMap={submittedIds}
          onMatchChange={(pairId, rightText) =>
            setMatches((prev) => ({ ...prev, [pairId]: rightText }))
          }
          onSubmitPair={handleSubmitOne}
          onResetPair={handleResetOne}
          onSubmitSet={handleSubmitAll}
          onResetSet={() => setSubmittedIds({})}
        />
      ) : (
        <div className="space-y-4">
          {randomizedSigns.map((sign, idx) => {
            const fmt =
              activeMode === "mixed" ? getMixedFormat(idx) : activeMode;
            const indexLabel = `Item ${idx + 1} of ${randomizedSigns.length} (Sign ${sign.number})`;
            const isItemSubmitted = Boolean(submittedIds[sign.id]);

            if (fmt === "true-false") {
              const tf = tfStatementsMap[sign.id];
              return (
                <TrueFalseQuestion
                  key={sign.id}
                  indexLabel={indexLabel}
                  headerBadge="True / False"
                  preContent={<SignPlaque sign={sign} />}
                  statement={tf.statement}
                  selectedValue={tfSelections[sign.id]}
                  correctAnswer={tf.isTrue}
                  submitted={isItemSubmitted}
                  evidence={`Correct interpretation of ${sign.title}: "${sign.correctAnswer}"`}
                  onSelect={(val) =>
                    setTfSelections((prev) => ({ ...prev, [sign.id]: val }))
                  }
                  onSubmit={() => handleSubmitOne(sign.id)}
                  onReset={() => handleResetOne(sign.id)}
                />
              );
            }

            if (fmt === "reorder-words") {
              return (
                <ReorderWordsQuestion
                  key={sign.id}
                  indexLabel={indexLabel}
                  headerBadge="Reorder Words"
                  preContent={<SignPlaque sign={sign} />}
                  clueText={sign.title}
                  targetSentence={sign.correctAnswer}
                  availableTokens={reorderTokensMap[sign.id] || []}
                  selectedTokenIds={reorderedIds[sign.id] || []}
                  submitted={isItemSubmitted}
                  onChangeSelectedIds={(ids) =>
                    setReorderedIds((prev) => ({ ...prev, [sign.id]: ids }))
                  }
                  onSubmit={() => handleSubmitOne(sign.id)}
                  onReset={() => handleResetOne(sign.id)}
                />
              );
            }

            if (fmt === "type-the-answer") {
              return (
                <TypeAnswerQuestion
                  key={sign.id}
                  indexLabel={indexLabel}
                  headerBadge="Type the Answer"
                  preContent={<SignPlaque sign={sign} />}
                  originalSentence={sign.title}
                  userAnswer={typedAnswers[sign.id] || ""}
                  modelAnswer={sign.correctAnswer}
                  acceptedAnswers={[sign.correctAnswer]}
                  submitted={isItemSubmitted}
                  placeholder="Type the correct meaning of this sign..."
                  onChange={(val) =>
                    setTypedAnswers((prev) => ({ ...prev, [sign.id]: val }))
                  }
                  onSubmit={() => handleSubmitOne(sign.id)}
                  onReset={() => handleResetOne(sign.id)}
                />
              );
            }

            return (
              <MultipleChoiceQuestion
                key={sign.id}
                indexLabel={indexLabel}
                headerBadge="Sign & Notice"
                preContent={<SignPlaque sign={sign} />}
                prompt={sign.title}
                options={shuffledOptionsMap[sign.id] || sign.options}
                selectedOption={mcSelections[sign.id]}
                correctAnswer={sign.correctAnswer}
                submitted={isItemSubmitted}
                onSelect={(opt) =>
                  setMcSelections((prev) => ({ ...prev, [sign.id]: opt }))
                }
                onSubmit={() => handleSubmitOne(sign.id)}
                onReset={() => handleResetOne(sign.id)}
              />
            );
          })}
        </div>
      )}

      {activeMode !== "flashcard" && (
        <div className="studio-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-6 py-4">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {allSubmitted
              ? "All 10 sign questions have been submitted. Click Try Again on any card or Reset & Randomize."
              : `Submitted ${scoreSummary.submittedCount} of ${scoreSummary.total} signs. Submit each card individually or submit all remaining.`}
          </span>
          <div className="flex items-center gap-3">
            {!allSubmitted && (
              <button
                type="button"
                onClick={handleSubmitAll}
                className="rounded-xl border border-[#a36c1d] bg-[#a36c1d] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#825414] dark:border-[#e0a84e] dark:bg-[#e0a84e] dark:text-stone-950"
              >
                Submit All Remaining
              </button>
            )}
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-xs font-semibold text-stone-700 transition-all hover:border-[#a36c1d] hover:text-[#784f12] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-[#e0a84e] dark:hover:text-[#f2cf94]"
            >
              Reset & Randomize
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
