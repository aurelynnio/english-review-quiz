"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  WRITING_INSTRUCTION,
  WRITING_QUESTIONS,
  WritingQuestion,
} from "@/data/questions";
import {
  seededShuffle,
  evaluateWritingAnswer,
  tokenizeWords,
} from "@/utils/quizUtils";
import { TypeAnswerQuestion } from "@/components/questions/TypeAnswerQuestion";
import {
  ReorderWordsQuestion,
  WordToken,
} from "@/components/questions/ReorderWordsQuestion";
import {
  FillInTheBlankQuestion,
  isFillBlankCorrect,
} from "@/components/questions/FillInTheBlankQuestion";
import {
  MatchingQuestion,
  MatchingPair,
} from "@/components/questions/MatchingQuestion";
import {
  FlashcardDeck,
  FlashcardItem,
} from "@/components/questions/FlashcardDeck";

type WritingPracticeMode =
  | "type-the-answer"
  | "mixed"
  | "reorder-words"
  | "fill-in-the-blank"
  | "matching"
  | "flashcard";

function extractKeyPhraseBlank(question: WritingQuestion): {
  promptWithBlank: string;
  missingPhrase: string;
} {
  const words = tokenizeWords(question.modelAnswer);
  const kwLower = question.keyword.toLowerCase();
  const kwIndex = words.findIndex((w) =>
    w.toLowerCase().replace(/[^a-z]/g, "").includes(kwLower)
  );

  if (kwIndex === -1) {
    return {
      promptWithBlank: `${question.originalSentence} → ______`,
      missingPhrase: question.modelAnswer,
    };
  }

  const start = Math.max(0, kwIndex);
  const end = Math.min(words.length, kwIndex + 2);
  const rawMissing = words
    .slice(start, end)
    .join(" ")
    .replace(/[.,!?]+$/, "");

  const before = words.slice(0, start).join(" ");
  const after = words.slice(end).join(" ");
  const promptWithBlank = `${question.originalSentence} (${question.keyword}) → ${
    before ? before + " " : ""
  }______${after ? " " + after : ""}`;

  return {
    promptWithBlank,
    missingPhrase: rawMissing,
  };
}

export function WritingSection({
  globalReviewMode,
}: {
  globalReviewMode: boolean;
}) {
  const [seed, setSeed] = useState<number>(101);
  const [mode, setMode] = useState<WritingPracticeMode>("type-the-answer");
  const [submittedIds, setSubmittedIds] = useState<Record<string, boolean>>({});

  const [typedAnswers, setTypedAnswers] = useState<Record<string, string>>({});
  const [reorderedIds, setReorderedIds] = useState<Record<string, string[]>>(
    {}
  );
  const [matches, setMatches] = useState<Record<string, string>>({});

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 100000) + 1);
  }, []);

  const activeMode: WritingPracticeMode = globalReviewMode ? "flashcard" : mode;

  const randomizedQuestions = useMemo(
    () => seededShuffle(WRITING_QUESTIONS, seed),
    [seed]
  );

  const wordTokensByQuestion = useMemo(() => {
    const map: Record<string, WordToken[]> = {};
    randomizedQuestions.forEach((q, idx) => {
      const words = tokenizeWords(q.modelAnswer);
      const tokens: WordToken[] = words.map((w, wIdx) => ({
        id: `${q.id}-tok-${wIdx}`,
        word: w,
      }));
      map[q.id] = seededShuffle(tokens, seed + idx * 17 + 7);
    });
    return map;
  }, [randomizedQuestions, seed]);

  const matchingPairs: MatchingPair[] = useMemo(
    () =>
      randomizedQuestions.map((q) => ({
        id: q.id,
        numberLabel: `Question ${q.number}`,
        leftText: `${q.originalSentence} (${q.keyword})`,
        rightText: q.modelAnswer,
        note: q.note,
      })),
    [randomizedQuestions]
  );

  const shuffledMatchingRight = useMemo(
    () =>
      seededShuffle(
        matchingPairs.map((p) => p.rightText),
        seed + 999
      ),
    [matchingPairs, seed]
  );

  const flashcards: FlashcardItem[] = useMemo(
    () =>
      randomizedQuestions.map((q) => ({
        id: q.id,
        label: `Writing #${q.number}`,
        frontTitle: "Sentence Transformation",
        frontText: q.originalSentence,
        frontHint: `Keyword: (${q.keyword})`,
        backAnswer: q.modelAnswer,
        backNote: q.note,
      })),
    [randomizedQuestions]
  );

  const getQuestionFormat = (idx: number): WritingPracticeMode => {
    if (activeMode !== "mixed") return activeMode;
    const cycle: WritingPracticeMode[] = [
      "type-the-answer",
      "reorder-words",
      "fill-in-the-blank",
    ];
    return cycle[idx % cycle.length];
  };

  const evaluateSingleQuestion = (
    q: WritingQuestion,
    idx: number
  ): boolean => {
    if (activeMode === "matching") {
      return matches[q.id] === q.modelAnswer;
    }
    const fmt = getQuestionFormat(idx);
    if (fmt === "type-the-answer") {
      return evaluateWritingAnswer(typedAnswers[q.id] || "", q.acceptedAnswers)
        .isExactMatch;
    }
    if (fmt === "reorder-words") {
      const tokens = wordTokensByQuestion[q.id] || [];
      const tokenMap = new Map(tokens.map((t) => [t.id, t.word]));
      const assembled = (reorderedIds[q.id] || [])
        .map((id) => tokenMap.get(id) ?? "")
        .join(" ");
      return evaluateWritingAnswer(assembled, q.acceptedAnswers).isExactMatch;
    }
    if (fmt === "fill-in-the-blank") {
      const { missingPhrase } = extractKeyPhraseBlank(q);
      return isFillBlankCorrect(typedAnswers[q.id] || "", missingPhrase);
    }
    return false;
  };

  const scoreSummary = useMemo(() => {
    const total = randomizedQuestions.length;
    let submittedCount = 0;
    let correct = 0;

    randomizedQuestions.forEach((q, idx) => {
      if (submittedIds[q.id]) {
        submittedCount++;
        if (evaluateSingleQuestion(q, idx)) {
          correct++;
        }
      }
    });

    return {
      correct,
      submittedCount,
      total,
      allSubmitted: total > 0 && submittedCount === total,
    };
  }, [
    submittedIds,
    activeMode,
    randomizedQuestions,
    matches,
    typedAnswers,
    reorderedIds,
    wordTokensByQuestion,
  ]);

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
    randomizedQuestions.forEach((q) => {
      next[q.id] = true;
    });
    setSubmittedIds(next);
  };

  const handleRetry = () => {
    setSubmittedIds({});
    setTypedAnswers({});
    setReorderedIds({});
    setMatches({});
    setSeed(Math.floor(Math.random() * 100000) + 1);
  };

  return (
    <section className="space-y-6">
      <div className="studio-card overflow-hidden rounded-2xl border border-l-4 border-l-[#b84a27] dark:border-l-[#e2724d]">
        <div className="border-b border-[#efb9a6]/60 bg-gradient-to-r from-[#f9ece7]/85 via-[#f9ece7]/35 to-transparent px-6 py-5 dark:border-[#782b12]/50 dark:from-[#2e1913]/60 dark:via-[#2e1913]/20 dark:to-transparent">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-md border border-[#efb9a6] bg-[#f9ece7] px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase text-[#94381b] dark:border-[#782b12] dark:bg-[#2e1913] dark:text-[#f5b8a3]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#b84a27] dark:bg-[#e2724d]" />
                Sec 01 • Questions 41–50
              </span>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                1. Writing — Sentence Transformation
              </h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                {WRITING_INSTRUCTION}
              </p>
            </div>

            <div className="studio-subcard flex flex-wrap items-center gap-1 rounded-xl border p-1">
              {(
                [
                  {
                    id: "type-the-answer",
                    label: "Type Answer (Word Diff)",
                  },
                  { id: "mixed", label: "Mixed Formats" },
                  { id: "reorder-words", label: "Reorder Words" },
                  { id: "fill-in-the-blank", label: "Fill in the Blank" },
                  { id: "matching", label: "Matching" },
                  { id: "flashcard", label: "Flashcards" },
                ] as { id: WritingPracticeMode; label: string }[]
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
                        ? "bg-[#b84a27] text-white shadow-2xs dark:bg-[#d4603b] dark:text-white"
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
                    className="h-full rounded-full bg-[#b84a27] transition-all duration-300 dark:bg-[#e2724d]"
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
                <span className="font-mono text-xs font-bold text-[#94381b] dark:text-[#f5b8a3]">
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
                        : "text-[#94381b] dark:text-[#f5b8a3]"
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
            <div className="flex items-center gap-2">
              {!scoreSummary.allSubmitted && (
                <button
                  type="button"
                  onClick={handleSubmitAll}
                  className="rounded-xl border border-[#efb9a6] bg-[#f9ece7]/70 px-3.5 py-1.5 text-xs font-semibold text-[#94381b] transition-all hover:bg-[#b84a27] hover:text-white dark:border-[#782b12] dark:bg-[#2e1913] dark:text-[#f5b8a3] dark:hover:bg-[#d4603b] dark:hover:text-white"
                >
                  Submit All Remaining
                </button>
              )}
              {scoreSummary.submittedCount > 0 && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="rounded-xl border border-[#b84a27] bg-[#b84a27] px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#94381b] dark:border-[#e2724d] dark:bg-[#d4603b]"
                >
                  Reset & Randomize
                </button>
              )}
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
          title="Match each original sentence and keyword with its transformed sentence"
          pairs={matchingPairs}
          shuffledRightOptions={shuffledMatchingRight}
          userMatches={matches}
          submitted={scoreSummary.allSubmitted}
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
          {randomizedQuestions.map((q, idx) => {
            const fmt = getQuestionFormat(idx);
            const indexLabel = `Item ${idx + 1} of ${randomizedQuestions.length} (Question ${q.number})`;
            const isSub = Boolean(submittedIds[q.id]);

            if (fmt === "reorder-words") {
              return (
                <ReorderWordsQuestion
                  key={q.id}
                  indexLabel={indexLabel}
                  headerBadge="Reorder Words"
                  clueText={q.originalSentence}
                  keyword={q.keyword}
                  targetSentence={q.modelAnswer}
                  acceptedAnswers={q.acceptedAnswers}
                  availableTokens={wordTokensByQuestion[q.id] || []}
                  selectedTokenIds={reorderedIds[q.id] || []}
                  submitted={isSub}
                  note={q.note}
                  onChangeSelectedIds={(ids) =>
                    setReorderedIds((prev) => ({ ...prev, [q.id]: ids }))
                  }
                  onSubmit={() => handleSubmitOne(q.id)}
                  onReset={() => handleResetOne(q.id)}
                />
              );
            }

            if (fmt === "fill-in-the-blank") {
              const { promptWithBlank, missingPhrase } =
                extractKeyPhraseBlank(q);
              return (
                <FillInTheBlankQuestion
                  key={q.id}
                  indexLabel={indexLabel}
                  headerBadge="Fill in the Blank"
                  prompt={promptWithBlank}
                  userAnswer={typedAnswers[q.id] || ""}
                  correctAnswer={missingPhrase}
                  submitted={isSub}
                  note={`Full model sentence: ${q.modelAnswer}${
                    q.note ? ` — ${q.note}` : ""
                  }`}
                  onChange={(val) =>
                    setTypedAnswers((prev) => ({ ...prev, [q.id]: val }))
                  }
                  onSubmit={() => handleSubmitOne(q.id)}
                  onReset={() => handleResetOne(q.id)}
                />
              );
            }

            return (
              <TypeAnswerQuestion
                key={q.id}
                indexLabel={indexLabel}
                headerBadge="Sentence Transformation"
                originalSentence={q.originalSentence}
                keyword={q.keyword}
                userAnswer={typedAnswers[q.id] || ""}
                modelAnswer={q.modelAnswer}
                acceptedAnswers={q.acceptedAnswers}
                note={q.note}
                submitted={isSub}
                onChange={(val) =>
                  setTypedAnswers((prev) => ({ ...prev, [q.id]: val }))
                }
                onSubmit={() => handleSubmitOne(q.id)}
                onReset={() => handleResetOne(q.id)}
              />
            );
          })}
        </div>
      )}

      {activeMode !== "flashcard" && (
        <div className="studio-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-6 py-4">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {scoreSummary.allSubmitted
              ? "All 10 questions submitted! Click Try Again on any card or Reset & Randomize to practice again."
              : `Submitted ${scoreSummary.submittedCount} of ${scoreSummary.total} questions. You can submit each question individually above or submit all remaining.`}
          </span>
          <div className="flex items-center gap-3">
            {!scoreSummary.allSubmitted && (
              <button
                type="button"
                onClick={handleSubmitAll}
                className="rounded-xl border border-[#b84a27] bg-[#b84a27] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#94381b] dark:border-[#e2724d] dark:bg-[#d4603b]"
              >
                Submit All Remaining
              </button>
            )}
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-xs font-semibold text-stone-700 transition-all hover:border-[#b84a27] hover:text-[#94381b] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-[#e2724d] dark:hover:text-[#f5b8a3]"
            >
              Reset & Randomize Section
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
