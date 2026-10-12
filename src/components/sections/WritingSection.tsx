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
      <div className="rounded-2xl border border-t-4 border-neutral-200/80 border-t-indigo-500 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:border-t-indigo-400 dark:bg-neutral-900">
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-4 md:flex-row md:items-center dark:border-neutral-800/80">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/90 bg-indigo-50/90 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:border-indigo-800/80 dark:bg-indigo-950/60 dark:text-indigo-300">
              Section 1 • Questions 41–50
            </span>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              1. Writing — Sentence Transformation
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {WRITING_INSTRUCTION}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
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
                  className={`rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-2xs dark:border-indigo-500 dark:bg-indigo-600 dark:text-white"
                      : "border-neutral-200/90 bg-neutral-50/70 text-neutral-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeMode !== "flashcard" && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-indigo-200/80 bg-indigo-50/50 px-4 py-3 dark:border-indigo-900/60 dark:bg-indigo-950/30">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div>
                <span className="font-medium text-neutral-600 dark:text-neutral-400">
                  Progress:{" "}
                </span>
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                  {scoreSummary.submittedCount} / {scoreSummary.total} Submitted
                </span>
              </div>
              {scoreSummary.submittedCount > 0 && (
                <div>
                  <span className="font-medium text-neutral-600 dark:text-neutral-400">
                    Score:{" "}
                  </span>
                  <span
                    className={`font-semibold ${
                      scoreSummary.correct === scoreSummary.submittedCount
                        ? "text-green-700 dark:text-green-400"
                        : "text-indigo-700 dark:text-indigo-300"
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
                  className="rounded-xl border border-indigo-300 bg-white px-3.5 py-1.5 text-xs font-medium text-indigo-700 transition-all hover:border-indigo-600 hover:bg-indigo-600 hover:text-white dark:border-indigo-700 dark:bg-neutral-900 dark:text-indigo-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-600 dark:hover:text-white"
                >
                  Submit All Remaining
                </button>
              )}
              {scoreSummary.submittedCount > 0 && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="rounded-xl border border-indigo-600 bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:bg-indigo-700 dark:border-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500"
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
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-white px-6 py-4 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {scoreSummary.allSubmitted
              ? "All 10 questions submitted! Click Try Again on any card or Reset & Randomize to practice again."
              : `Submitted ${scoreSummary.submittedCount} of ${scoreSummary.total} questions. You can submit each question individually above or submit all remaining.`}
          </span>
          <div className="flex items-center gap-3">
            {!scoreSummary.allSubmitted && (
              <button
                type="button"
                onClick={handleSubmitAll}
                className="rounded-xl border border-indigo-600 bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-indigo-700 dark:border-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                Submit All Remaining
              </button>
            )}
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-xs font-medium text-neutral-700 transition-all hover:border-indigo-500 hover:text-indigo-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
            >
              Reset & Randomize Section
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
