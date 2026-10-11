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

function SignPlaque({ sign }: { sign: SignQuestion }) {
  return (
    <div className="rounded-xl border border-neutral-300/90 bg-neutral-50/80 p-4 dark:border-neutral-700 dark:bg-neutral-950/80">
      <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2 text-[11px] font-medium text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        <span>Notice / Sign #{sign.number}</span>
        <span className="font-mono">{sign.imageFile}</span>
      </div>
      <div className="py-3 text-center text-base font-semibold tracking-wide text-neutral-900 dark:text-neutral-100">
        {sign.signText}
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
  const [submitted, setSubmitted] = useState(false);

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
    if (!submitted) return { correct: 0, total: randomizedSigns.length };
    let correct = 0;

    if (activeMode === "matching") {
      randomizedSigns.forEach((s) => {
        if (evaluateSignItem(s, "matching")) correct++;
      });
    } else if (activeMode === "mixed") {
      randomizedSigns.forEach((s, idx) => {
        if (evaluateSignItem(s, getMixedFormat(idx))) correct++;
      });
    } else if (activeMode !== "flashcard") {
      randomizedSigns.forEach((s) => {
        if (evaluateSignItem(s, activeMode)) correct++;
      });
    }

    return { correct, total: randomizedSigns.length };
  }, [
    submitted,
    activeMode,
    randomizedSigns,
    mcSelections,
    tfSelections,
    reorderedIds,
    typedAnswers,
    matches,
  ]);

  const handleRetry = () => {
    setSubmitted(false);
    setMcSelections({});
    setTfSelections({});
    setTypedAnswers({});
    setReorderedIds({});
    setMatches({});
    setSeed(Math.floor(Math.random() * 100000) + 1);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800/80">
          <div>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Section 4 • Signs 1–10
            </span>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              4. Reading — Signs & Notices
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Read each sign or notice carefully and identify its accurate
              interpretation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
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
          title="Match each Sign / Notice with its correct meaning"
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
          {randomizedSigns.map((sign, idx) => {
            const fmt =
              activeMode === "mixed" ? getMixedFormat(idx) : activeMode;
            const indexLabel = `Item ${idx + 1} of ${randomizedSigns.length} (Sign ${sign.number})`;

            if (fmt === "true-false") {
              const tf = tfStatementsMap[sign.id];
              return (
                <TrueFalseQuestion
                  key={sign.id}
                  indexLabel={indexLabel}
                  headerBadge="True / False"
                  statement={tf.statement}
                  selectedValue={tfSelections[sign.id]}
                  correctAnswer={tf.isTrue}
                  submitted={submitted}
                  evidence={`Correct interpretation of ${sign.title}: "${sign.correctAnswer}"`}
                  onSelect={(val) =>
                    setTfSelections((prev) => ({ ...prev, [sign.id]: val }))
                  }
                />
              );
            }

            if (fmt === "reorder-words") {
              return (
                <ReorderWordsQuestion
                  key={sign.id}
                  indexLabel={indexLabel}
                  headerBadge="Reorder Words"
                  clueText={sign.title}
                  targetSentence={sign.correctAnswer}
                  availableTokens={reorderTokensMap[sign.id] || []}
                  selectedTokenIds={reorderedIds[sign.id] || []}
                  submitted={submitted}
                  onChangeSelectedIds={(ids) =>
                    setReorderedIds((prev) => ({ ...prev, [sign.id]: ids }))
                  }
                />
              );
            }

            if (fmt === "type-the-answer") {
              return (
                <TypeAnswerQuestion
                  key={sign.id}
                  indexLabel={indexLabel}
                  headerBadge="Type the Answer"
                  originalSentence={sign.title}
                  userAnswer={typedAnswers[sign.id] || ""}
                  modelAnswer={sign.correctAnswer}
                  acceptedAnswers={[sign.correctAnswer]}
                  submitted={submitted}
                  placeholder="Type the correct meaning of this sign..."
                  onChange={(val) =>
                    setTypedAnswers((prev) => ({ ...prev, [sign.id]: val }))
                  }
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
                submitted={submitted}
                onSelect={(opt) =>
                  setMcSelections((prev) => ({ ...prev, [sign.id]: opt }))
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
              ? "Answers are locked. Click Retry to randomize and practice again."
              : "Complete all 10 sign questions above, then click Submit."}
          </span>
          <div className="flex items-center gap-3">
            {submitted ? (
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-xl border border-neutral-900 bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition-all hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Retry Signs Section
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="rounded-xl border border-neutral-900 bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition-all hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Submit Signs Section
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
