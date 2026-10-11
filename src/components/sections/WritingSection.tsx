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
  const [submitted, setSubmitted] = useState(false);

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

  const scoreSummary = useMemo(() => {
    if (!submitted) return { correct: 0, total: randomizedQuestions.length };

    if (activeMode === "matching") {
      const correct = matchingPairs.filter(
        (p) => matches[p.id] === p.rightText
      ).length;
      return { correct, total: matchingPairs.length };
    }

    let correct = 0;
    randomizedQuestions.forEach((q, idx) => {
      const fmt = getQuestionFormat(idx);
      if (fmt === "type-the-answer") {
        const res = evaluateWritingAnswer(
          typedAnswers[q.id] || "",
          q.acceptedAnswers
        );
        if (res.isExactMatch) correct++;
      } else if (fmt === "reorder-words") {
        const tokens = wordTokensByQuestion[q.id] || [];
        const tokenMap = new Map(tokens.map((t) => [t.id, t.word]));
        const assembled = (reorderedIds[q.id] || [])
          .map((id) => tokenMap.get(id) ?? "")
          .join(" ");
        const res = evaluateWritingAnswer(assembled, q.acceptedAnswers);
        if (res.isExactMatch) correct++;
      } else if (fmt === "fill-in-the-blank") {
        const { missingPhrase } = extractKeyPhraseBlank(q);
        if (isFillBlankCorrect(typedAnswers[q.id] || "", missingPhrase)) {
          correct++;
        }
      }
    });

    return { correct, total: randomizedQuestions.length };
  }, [
    submitted,
    activeMode,
    randomizedQuestions,
    matchingPairs,
    matches,
    typedAnswers,
    reorderedIds,
    wordTokensByQuestion,
  ]);

  const handleRetry = () => {
    setSubmitted(false);
    setTypedAnswers({});
    setReorderedIds({});
    setMatches({});
    setSeed(Math.floor(Math.random() * 100000) + 1);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-4 md:flex-row md:items-center dark:border-neutral-800/80">
          <div>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Section 1 • Questions 41–50
            </span>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
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
                    setSubmitted(false);
                  }}
                  className={`rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "border-neutral-900 bg-neutral-900 text-white shadow-2xs dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                      : "border-neutral-200/90 bg-neutral-50/70 text-neutral-700 hover:border-neutral-300 hover:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {submitted && activeMode !== "flashcard" && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200/90 bg-neutral-50/80 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="text-sm">
              <span className="font-medium text-neutral-600 dark:text-neutral-400">
                Section Score:{" "}
              </span>
              <span
                className={`font-semibold ${
                  scoreSummary.correct === scoreSummary.total
                    ? "text-green-700 dark:text-green-400"
                    : "text-neutral-900 dark:text-neutral-100"
                }`}
              >
                {scoreSummary.correct} / {scoreSummary.total} (
                {Math.round((scoreSummary.correct / scoreSummary.total) * 100)}
                %)
              </span>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl border border-neutral-300 bg-white px-4 py-1.5 text-xs font-medium text-neutral-800 transition-all hover:border-neutral-900 hover:bg-neutral-900 hover:text-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-900"
            >
              Retry & Randomize
            </button>
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
          submitted={submitted}
          onMatchChange={(pairId, rightText) =>
            setMatches((prev) => ({ ...prev, [pairId]: rightText }))
          }
        />
      ) : (
        <div className="space-y-4">
          {randomizedQuestions.map((q, idx) => {
            const fmt = getQuestionFormat(idx);
            const indexLabel = `Item ${idx + 1} of ${randomizedQuestions.length} (Question ${q.number})`;

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
                  submitted={submitted}
                  note={q.note}
                  onChangeSelectedIds={(ids) =>
                    setReorderedIds((prev) => ({ ...prev, [q.id]: ids }))
                  }
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
                  submitted={submitted}
                  note={`Full model sentence: ${q.modelAnswer}${
                    q.note ? ` — ${q.note}` : ""
                  }`}
                  onChange={(val) =>
                    setTypedAnswers((prev) => ({ ...prev, [q.id]: val }))
                  }
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
                submitted={submitted}
                onChange={(val) =>
                  setTypedAnswers((prev) => ({ ...prev, [q.id]: val }))
                }
              />
            );
          })}
        </div>
      )}

      {activeMode !== "flashcard" && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-white px-6 py-4 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {submitted
              ? "Answers are locked. Click Retry to shuffle and practice again."
              : "Complete your answers above, then submit to lock and view word-level feedback."}
          </span>
          <div className="flex items-center gap-3">
            {submitted ? (
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-xl border border-neutral-900 bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition-all hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Retry Section
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="rounded-xl border border-neutral-900 bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition-all hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Submit Writing Section
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
