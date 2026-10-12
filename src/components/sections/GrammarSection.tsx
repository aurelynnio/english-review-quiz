"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  GRAMMAR_QUESTIONS,
  MultipleChoiceItem,
  QuestionFormat,
} from "@/data/questions";
import {
  seededShuffle,
  tokenizeWords,
  evaluateWritingAnswer,
} from "@/utils/quizUtils";
import { MultipleChoiceQuestion } from "@/components/questions/MultipleChoiceQuestion";
import { TrueFalseQuestion } from "@/components/questions/TrueFalseQuestion";
import {
  FillInTheBlankQuestion,
  isFillBlankCorrect,
} from "@/components/questions/FillInTheBlankQuestion";
import { TypeAnswerQuestion } from "@/components/questions/TypeAnswerQuestion";
import {
  ReorderWordsQuestion,
  WordToken,
} from "@/components/questions/ReorderWordsQuestion";
import {
  ErrorSpottingQuestion,
  ErrorSegment,
} from "@/components/questions/ErrorSpottingQuestion";
import {
  MatchingQuestion,
  MatchingPair,
} from "@/components/questions/MatchingQuestion";
import {
  FlashcardDeck,
  FlashcardItem,
} from "@/components/questions/FlashcardDeck";

type GrammarMode = "mixed" | QuestionFormat;

interface DerivedErrorItem {
  segments: ErrorSegment[];
  correctSegmentId: string;
  correctionOptions: string[];
  correctReplacement: string;
}

function buildCompleteSentence(item: MultipleChoiceItem, fill: string): string {
  return item.prompt.replace(/_{3,}/, fill);
}

function deriveErrorSpotting(
  item: MultipleChoiceItem,
  seed: number
): DerivedErrorItem {
  const wrongOptions = item.options.filter((o) => o !== item.correctAnswer);
  const chosenWrong =
    seededShuffle(wrongOptions, seed)[0] ?? wrongOptions[0] ?? "";

  const parts = item.prompt.split(/_{3,}/);
  const beforeWords = tokenizeWords(parts[0] || "");
  const afterWords = tokenizeWords(parts[1] || "");

  const segments: ErrorSegment[] = [];

  if (beforeWords.length > 3) {
    const mid = Math.ceil(beforeWords.length / 2);
    segments.push({
      id: `${item.id}-seg-b1`,
      text: beforeWords.slice(0, mid).join(" "),
      isErrorTarget: false,
    });
    segments.push({
      id: `${item.id}-seg-b2`,
      text: beforeWords.slice(mid).join(" "),
      isErrorTarget: false,
    });
  } else if (beforeWords.length > 0) {
    segments.push({
      id: `${item.id}-seg-b1`,
      text: beforeWords.join(" "),
      isErrorTarget: false,
    });
  }

  const errorSegId = `${item.id}-seg-err`;
  segments.push({
    id: errorSegId,
    text: chosenWrong,
    isErrorTarget: true,
  });

  if (afterWords.length > 3) {
    const mid = Math.ceil(afterWords.length / 2);
    segments.push({
      id: `${item.id}-seg-a1`,
      text: afterWords.slice(0, mid).join(" "),
      isErrorTarget: false,
    });
    segments.push({
      id: `${item.id}-seg-a2`,
      text: afterWords.slice(mid).join(" "),
      isErrorTarget: false,
    });
  } else if (afterWords.length > 0) {
    segments.push({
      id: `${item.id}-seg-a1`,
      text: afterWords.join(" "),
      isErrorTarget: false,
    });
  }

  const correctionOptions = seededShuffle(
    item.options.filter((o) => o !== chosenWrong),
    seed + 31
  );

  return {
    segments,
    correctSegmentId: errorSegId,
    correctionOptions,
    correctReplacement: item.correctAnswer,
  };
}

export function GrammarSection({
  globalReviewMode,
}: {
  globalReviewMode: boolean;
}) {
  const [seed, setSeed] = useState<number>(303);
  const [mode, setMode] = useState<GrammarMode>("mixed");
  const [submittedIds, setSubmittedIds] = useState<Record<string, boolean>>({});

  const [mcSelections, setMcSelections] = useState<Record<string, string>>({});
  const [tfSelections, setTfSelections] = useState<Record<string, boolean>>({});
  const [textInputs, setTextInputs] = useState<Record<string, string>>({});
  const [reorderState, setReorderState] = useState<Record<string, string[]>>(
    {}
  );
  const [errorSegmentState, setErrorSegmentState] = useState<
    Record<string, string>
  >({});
  const [errorFixState, setErrorFixState] = useState<Record<string, string>>(
    {}
  );
  const [matchingState, setMatchingState] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 100000) + 1);
  }, []);

  const activeMode: GrammarMode = globalReviewMode ? "flashcard" : mode;

  const randomizedQuestions = useMemo(
    () => seededShuffle(GRAMMAR_QUESTIONS, seed),
    [seed]
  );

  const shuffledOptionsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    randomizedQuestions.forEach((q, idx) => {
      map[q.id] = seededShuffle(q.options, seed + idx * 23 + 5);
    });
    return map;
  }, [randomizedQuestions, seed]);

  const tfDerivedMap = useMemo(() => {
    const map: Record<
      string,
      { statement: string; isTrue: boolean; shownOption: string }
    > = {};
    randomizedQuestions.forEach((q, idx) => {
      const isTrue = (seed + idx) % 2 === 0;
      const wrongOpts = q.options.filter((o) => o !== q.correctAnswer);
      const shownOption = isTrue
        ? q.correctAnswer
        : seededShuffle(wrongOpts, seed + idx * 13)[0] ?? q.correctAnswer;
      const statement = `${q.prompt.replace(
        /_{3,}/,
        `[${shownOption}]`
      )} — Is the bracketed phrase grammatically correct?`;
      map[q.id] = { statement, isTrue, shownOption };
    });
    return map;
  }, [randomizedQuestions, seed]);

  const reorderTokensMap = useMemo(() => {
    const map: Record<string, WordToken[]> = {};
    randomizedQuestions.forEach((q, idx) => {
      const full = buildCompleteSentence(q, q.correctAnswer);
      const words = tokenizeWords(full);
      const tokens = words.map((w, wIdx) => ({
        id: `${q.id}-rw-${wIdx}`,
        word: w,
      }));
      map[q.id] = seededShuffle(tokens, seed + idx * 41);
    });
    return map;
  }, [randomizedQuestions, seed]);

  const errorSpottingMap = useMemo(() => {
    const map: Record<string, DerivedErrorItem> = {};
    randomizedQuestions.forEach((q, idx) => {
      map[q.id] = deriveErrorSpotting(q, seed + idx * 53);
    });
    return map;
  }, [randomizedQuestions, seed]);

  const mixedIndividualQuestions = useMemo(
    () => randomizedQuestions.slice(0, 18),
    [randomizedQuestions]
  );
  const mixedMatchingQuestions = useMemo(
    () => randomizedQuestions.slice(18),
    [randomizedQuestions]
  );

  const getQuestionFormatForMixed = (idx: number): QuestionFormat => {
    const cycle: QuestionFormat[] = [
      "multiple-choice",
      "fill-in-the-blank",
      "true-false",
      "error-spotting",
      "reorder-words",
      "type-the-answer",
    ];
    return cycle[idx % cycle.length];
  };

  const matchingBatches = useMemo(() => {
    const source =
      activeMode === "mixed" ? mixedMatchingQuestions : randomizedQuestions;
    const batches: {
      batchIndex: number;
      pairs: MatchingPair[];
      shuffledRight: string[];
    }[] = [];
    const batchSize = 6;
    for (let i = 0; i < source.length; i += batchSize) {
      const slice = source.slice(i, i + batchSize);
      const pairs: MatchingPair[] = slice.map((q) => ({
        id: q.id,
        numberLabel: `Question ${q.number}`,
        leftText: q.prompt,
        rightText: q.correctAnswer,
      }));
      const shuffledRight = seededShuffle(
        pairs.map((p) => p.rightText),
        seed + i * 71 + 19
      );
      batches.push({ batchIndex: i / batchSize + 1, pairs, shuffledRight });
    }
    return batches;
  }, [activeMode, mixedMatchingQuestions, randomizedQuestions, seed]);

  const flashcards: FlashcardItem[] = useMemo(
    () =>
      randomizedQuestions.map((q) => ({
        id: q.id,
        label: `Grammar #${q.number}`,
        frontTitle: "Grammar Multiple Choice",
        frontText: q.prompt,
        frontHint: `Options: ${shuffledOptionsMap[q.id]?.join(" • ")}`,
        backAnswer: `${q.correctAnswer} — "${buildCompleteSentence(
          q,
          q.correctAnswer
        )}"`,
      })),
    [randomizedQuestions, shuffledOptionsMap]
  );

  const evaluateSingleQuestion = (
    q: MultipleChoiceItem,
    fmt: QuestionFormat
  ): boolean => {
    if (fmt === "multiple-choice") {
      return mcSelections[q.id] === q.correctAnswer;
    }
    if (fmt === "true-false") {
      const tf = tfDerivedMap[q.id];
      return tf && tfSelections[q.id] === tf.isTrue;
    }
    if (fmt === "fill-in-the-blank") {
      return isFillBlankCorrect(textInputs[q.id] || "", q.correctAnswer);
    }
    if (fmt === "type-the-answer") {
      const fullSentence = buildCompleteSentence(q, q.correctAnswer);
      const userVal = textInputs[q.id] || "";
      return (
        isFillBlankCorrect(userVal, q.correctAnswer) ||
        evaluateWritingAnswer(userVal, [fullSentence]).isExactMatch
      );
    }
    if (fmt === "reorder-words") {
      const tokens = reorderTokensMap[q.id] || [];
      const tokenMap = new Map(tokens.map((t) => [t.id, t.word]));
      const assembled = (reorderState[q.id] || [])
        .map((id) => tokenMap.get(id) ?? "")
        .join(" ");
      const fullSentence = buildCompleteSentence(q, q.correctAnswer);
      return evaluateWritingAnswer(assembled, [fullSentence]).isExactMatch;
    }
    if (fmt === "error-spotting") {
      const err = errorSpottingMap[q.id];
      return (
        !!err &&
        errorSegmentState[q.id] === err.correctSegmentId &&
        errorFixState[q.id] === err.correctReplacement
      );
    }
    if (fmt === "matching") {
      return matchingState[q.id] === q.correctAnswer;
    }
    return false;
  };

  const scoreSummary = useMemo(() => {
    const total = randomizedQuestions.length;
    let submittedCount = 0;
    let correct = 0;

    if (activeMode === "mixed") {
      mixedIndividualQuestions.forEach((q, idx) => {
        if (submittedIds[q.id]) {
          submittedCount++;
          const fmt = getQuestionFormatForMixed(idx);
          if (evaluateSingleQuestion(q, fmt)) correct++;
        }
      });
      mixedMatchingQuestions.forEach((q) => {
        if (submittedIds[q.id]) {
          submittedCount++;
          if (evaluateSingleQuestion(q, "matching")) correct++;
        }
      });
    } else if (activeMode === "matching") {
      randomizedQuestions.forEach((q) => {
        if (submittedIds[q.id]) {
          submittedCount++;
          if (evaluateSingleQuestion(q, "matching")) correct++;
        }
      });
    } else if (activeMode !== "flashcard") {
      randomizedQuestions.forEach((q) => {
        if (submittedIds[q.id]) {
          submittedCount++;
          if (evaluateSingleQuestion(q, activeMode)) correct++;
        }
      });
    }

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
    mixedIndividualQuestions,
    mixedMatchingQuestions,
    mcSelections,
    tfSelections,
    textInputs,
    reorderState,
    errorSegmentState,
    errorFixState,
    matchingState,
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

  const handleSubmitBatch = (pairs: MatchingPair[]) => {
    setSubmittedIds((prev) => {
      const next = { ...prev };
      pairs.forEach((p) => {
        next[p.id] = true;
      });
      return next;
    });
  };

  const handleResetBatch = (pairs: MatchingPair[]) => {
    setSubmittedIds((prev) => {
      const next = { ...prev };
      pairs.forEach((p) => {
        delete next[p.id];
      });
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
    setMcSelections({});
    setTfSelections({});
    setTextInputs({});
    setReorderState({});
    setErrorSegmentState({});
    setErrorFixState({});
    setMatchingState({});
    setSeed(Math.floor(Math.random() * 100000) + 1);
  };

  const renderQuestionByFormat = (
    q: MultipleChoiceItem,
    idx: number,
    totalCount: number,
    fmt: QuestionFormat
  ) => {
    const indexLabel = `Item ${idx + 1} of ${totalCount} (Question ${q.number})`;
    const isSub = Boolean(submittedIds[q.id]);

    if (fmt === "multiple-choice") {
      return (
        <MultipleChoiceQuestion
          key={q.id}
          indexLabel={indexLabel}
          headerBadge="Multiple Choice"
          prompt={q.prompt}
          options={shuffledOptionsMap[q.id] || q.options}
          selectedOption={mcSelections[q.id]}
          correctAnswer={q.correctAnswer}
          submitted={isSub}
          onSelect={(opt) =>
            setMcSelections((prev) => ({ ...prev, [q.id]: opt }))
          }
          onSubmit={() => handleSubmitOne(q.id)}
          onReset={() => handleResetOne(q.id)}
        />
      );
    }

    if (fmt === "true-false") {
      const tf = tfDerivedMap[q.id];
      return (
        <TrueFalseQuestion
          key={q.id}
          indexLabel={indexLabel}
          headerBadge="True / False"
          statement={tf.statement}
          selectedValue={tfSelections[q.id]}
          correctAnswer={tf.isTrue}
          submitted={isSub}
          reverseOptions={(seed + idx) % 3 === 0}
          evidence={`Correct phrase for blank: "${
            q.correctAnswer
          }" → Full sentence: "${buildCompleteSentence(q, q.correctAnswer)}"`}
          onSelect={(val) =>
            setTfSelections((prev) => ({ ...prev, [q.id]: val }))
          }
          onSubmit={() => handleSubmitOne(q.id)}
          onReset={() => handleResetOne(q.id)}
        />
      );
    }

    if (fmt === "fill-in-the-blank") {
      return (
        <FillInTheBlankQuestion
          key={q.id}
          indexLabel={indexLabel}
          headerBadge="Fill in the Blank"
          prompt={q.prompt}
          userAnswer={textInputs[q.id] || ""}
          correctAnswer={q.correctAnswer}
          wordBank={shuffledOptionsMap[q.id] || q.options}
          submitted={isSub}
          onChange={(val) =>
            setTextInputs((prev) => ({ ...prev, [q.id]: val }))
          }
          onSubmit={() => handleSubmitOne(q.id)}
          onReset={() => handleResetOne(q.id)}
        />
      );
    }

    if (fmt === "type-the-answer") {
      const fullSentence = buildCompleteSentence(q, q.correctAnswer);
      return (
        <TypeAnswerQuestion
          key={q.id}
          indexLabel={indexLabel}
          headerBadge="Type the Answer"
          originalSentence={q.prompt}
          keyword={`Options: ${(shuffledOptionsMap[q.id] || q.options).join(
            " / "
          )}`}
          userAnswer={textInputs[q.id] || ""}
          modelAnswer={fullSentence}
          acceptedAnswers={[fullSentence, q.correctAnswer]}
          submitted={isSub}
          placeholder="Type the complete sentence (or missing phrase)..."
          onChange={(val) =>
            setTextInputs((prev) => ({ ...prev, [q.id]: val }))
          }
          onSubmit={() => handleSubmitOne(q.id)}
          onReset={() => handleResetOne(q.id)}
        />
      );
    }

    if (fmt === "reorder-words") {
      const fullSentence = buildCompleteSentence(q, q.correctAnswer);
      return (
        <ReorderWordsQuestion
          key={q.id}
          indexLabel={indexLabel}
          headerBadge="Reorder Words"
          clueText={q.prompt}
          targetSentence={fullSentence}
          availableTokens={reorderTokensMap[q.id] || []}
          selectedTokenIds={reorderState[q.id] || []}
          submitted={isSub}
          note={`Missing grammar structure: "${q.correctAnswer}"`}
          onChangeSelectedIds={(ids) =>
            setReorderState((prev) => ({ ...prev, [q.id]: ids }))
          }
          onSubmit={() => handleSubmitOne(q.id)}
          onReset={() => handleResetOne(q.id)}
        />
      );
    }

    if (fmt === "error-spotting") {
      const err = errorSpottingMap[q.id];
      return (
        <ErrorSpottingQuestion
          key={q.id}
          indexLabel={indexLabel}
          headerBadge="Error Spotting"
          segments={err.segments}
          correctionOptions={err.correctionOptions}
          selectedSegmentId={errorSegmentState[q.id]}
          selectedCorrection={errorFixState[q.id]}
          correctSegmentId={err.correctSegmentId}
          correctReplacement={err.correctReplacement}
          submitted={isSub}
          note={`Complete correct sentence: "${buildCompleteSentence(
            q,
            q.correctAnswer
          )}"`}
          onSelectSegment={(segId) =>
            setErrorSegmentState((prev) => ({ ...prev, [q.id]: segId }))
          }
          onSelectCorrection={(fix) =>
            setErrorFixState((prev) => ({ ...prev, [q.id]: fix }))
          }
          onSubmit={() => handleSubmitOne(q.id)}
          onReset={() => handleResetOne(q.id)}
        />
      );
    }

    return null;
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-neutral-200/80 border-t-4 border-t-sky-500 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:border-t-sky-400 dark:bg-neutral-900">
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800/80">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/80 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-300">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-sky-400" />
              Section 3 • Questions 121–143 (23 Items)
            </span>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              3. Grammar — Multiple Choice & Active Retention Formats
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Practice all 23 grammar items using Mixed Retention Formats
              (combining Multiple Choice, Fill in the Blank, True/False, Error
              Spotting, Reorder Words, Type the Answer, and Matching) or select
              a single format below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "mixed", label: "Mixed Formats (Recommended)" },
                { id: "multiple-choice", label: "Multiple Choice" },
                { id: "true-false", label: "True / False" },
                { id: "fill-in-the-blank", label: "Fill in the Blank" },
                { id: "type-the-answer", label: "Type the Answer" },
                { id: "reorder-words", label: "Reorder Words" },
                { id: "error-spotting", label: "Error Spotting" },
                { id: "matching", label: "Matching" },
                { id: "flashcard", label: "Flashcards" },
              ] as { id: GrammarMode; label: string }[]
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
                      ? "border-sky-600 bg-sky-600 text-white shadow-2xs dark:border-sky-500 dark:bg-sky-500 dark:text-white"
                      : "border-neutral-200/90 bg-neutral-50/70 text-neutral-700 hover:border-sky-300 hover:bg-sky-50/50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-sky-700 dark:hover:bg-sky-950/40"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeMode !== "flashcard" && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-sky-200/80 bg-sky-50/50 px-4 py-3 dark:border-sky-800/60 dark:bg-sky-950/30">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div>
                <span className="font-medium text-neutral-600 dark:text-neutral-400">
                  Progress:{" "}
                </span>
                <span className="font-semibold text-sky-700 dark:text-sky-300">
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
                        : "text-sky-700 dark:text-sky-300"
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
                  className="rounded-xl border border-sky-300 bg-white px-3.5 py-1.5 text-xs font-medium text-sky-700 transition-all hover:border-sky-600 hover:bg-sky-600 hover:text-white dark:border-sky-700 dark:bg-neutral-900 dark:text-sky-300 dark:hover:border-sky-500 dark:hover:bg-sky-500 dark:hover:text-white"
                >
                  Submit All Remaining
                </button>
              )}
              {scoreSummary.submittedCount > 0 && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="rounded-xl border border-sky-600 bg-sky-600 px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:bg-sky-700 dark:border-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
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
        <div className="space-y-6">
          {matchingBatches.map((batch) => (
            <MatchingQuestion
              key={batch.batchIndex}
              title={`Grammar Matching Set ${batch.batchIndex} (Match each sentence with its missing expression)`}
              pairs={batch.pairs}
              shuffledRightOptions={batch.shuffledRight}
              userMatches={matchingState}
              submitted={scoreSummary.allSubmitted}
              submittedMap={submittedIds}
              onMatchChange={(pairId, rightText) =>
                setMatchingState((prev) => ({ ...prev, [pairId]: rightText }))
              }
              onSubmitPair={handleSubmitOne}
              onResetPair={handleResetOne}
              onSubmitSet={() => handleSubmitBatch(batch.pairs)}
              onResetSet={() => handleResetBatch(batch.pairs)}
            />
          ))}
        </div>
      ) : activeMode === "mixed" ? (
        <div className="space-y-4">
          {mixedIndividualQuestions.map((q, idx) =>
            renderQuestionByFormat(
              q,
              idx,
              randomizedQuestions.length,
              getQuestionFormatForMixed(idx)
            )
          )}
          {matchingBatches.map((batch) => (
            <MatchingQuestion
              key={`mixed-match-${batch.batchIndex}`}
              title="Items 19–23: Grammar Matching Block (Match each sentence with its missing expression)"
              pairs={batch.pairs}
              shuffledRightOptions={batch.shuffledRight}
              userMatches={matchingState}
              submitted={scoreSummary.allSubmitted}
              submittedMap={submittedIds}
              onMatchChange={(pairId, rightText) =>
                setMatchingState((prev) => ({ ...prev, [pairId]: rightText }))
              }
              onSubmitPair={handleSubmitOne}
              onResetPair={handleResetOne}
              onSubmitSet={() => handleSubmitBatch(batch.pairs)}
              onResetSet={() => handleResetBatch(batch.pairs)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {randomizedQuestions.map((q, idx) =>
            renderQuestionByFormat(
              q,
              idx,
              randomizedQuestions.length,
              activeMode
            )
          )}
        </div>
      )}

      {activeMode !== "flashcard" && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-white px-6 py-4 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {scoreSummary.allSubmitted
              ? "All 23 grammar items submitted! Click Try Again on any card or Reset & Randomize to practice again."
              : `Submitted ${scoreSummary.submittedCount} of ${scoreSummary.total} grammar items. Submit each question individually above or submit all remaining.`}
          </span>
          <div className="flex items-center gap-3">
            {!scoreSummary.allSubmitted && (
              <button
                type="button"
                onClick={handleSubmitAll}
                className="rounded-xl border border-sky-600 bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-sky-700 dark:border-sky-500 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400"
              >
                Submit All Remaining
              </button>
            )}
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-xs font-medium text-neutral-700 transition-all hover:border-sky-500 hover:text-sky-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
            >
              Reset & Randomize Section
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
