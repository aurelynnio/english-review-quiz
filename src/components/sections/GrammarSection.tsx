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
      <div className="studio-card overflow-hidden rounded-2xl border border-l-4 border-l-[#25416b] dark:border-l-[#6894d4]">
        <div className="border-b border-[#c5d4e8]/70 bg-gradient-to-r from-[#edf2f8]/90 via-[#edf2f8]/35 to-transparent px-6 py-5 dark:border-[#1e3559]/50 dark:from-[#132036]/60 dark:via-[#132036]/20 dark:to-transparent">
          <div className="flex flex-col justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-md border border-[#c5d4e8] bg-[#edf2f8] px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase text-[#1b3152] dark:border-[#1e3559] dark:bg-[#132036] dark:text-[#acc4e8]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#25416b] dark:bg-[#6894d4]" />
                Sec 03 • Questions 121–143 (23 Items)
              </span>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                3. Grammar — Multiple Choice & Active Retention Formats
              </h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Practice all 23 grammar items using Mixed Retention Formats
                (combining Multiple Choice, Fill in the Blank, True/False, Error
                Spotting, Reorder Words, Type the Answer, and Matching) or select
                a single format below.
              </p>
            </div>

            <div className="studio-subcard flex flex-wrap items-center gap-1 rounded-xl border p-1">
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
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#25416b] text-white shadow-2xs dark:bg-[#527bb8] dark:text-stone-950"
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
                    className="h-full rounded-full bg-[#25416b] transition-all duration-300 dark:bg-[#6894d4]"
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
                <span className="font-mono text-xs font-bold text-[#1b3152] dark:text-[#acc4e8]">
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
                        : "text-[#1b3152] dark:text-[#acc4e8]"
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
                  className="rounded-xl border border-[#c5d4e8] bg-[#edf2f8]/80 px-3.5 py-1.5 text-xs font-semibold text-[#1b3152] transition-all hover:bg-[#25416b] hover:text-white dark:border-[#1e3559] dark:bg-[#132036] dark:text-[#acc4e8] dark:hover:bg-[#527bb8] dark:hover:text-stone-950"
                >
                  Submit All Remaining
                </button>
              )}
              {scoreSummary.submittedCount > 0 && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="rounded-xl border border-[#25416b] bg-[#25416b] px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#1b3152] dark:border-[#527bb8] dark:bg-[#527bb8] dark:text-stone-950"
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
        <div className="studio-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-6 py-4">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {scoreSummary.allSubmitted
              ? "All 23 grammar items submitted! Click Try Again on any card or Reset & Randomize to practice again."
              : `Submitted ${scoreSummary.submittedCount} of ${scoreSummary.total} grammar items. Submit each question individually above or submit all remaining.`}
          </span>
          <div className="flex items-center gap-3">
            {!scoreSummary.allSubmitted && (
              <button
                type="button"
                onClick={handleSubmitAll}
                className="rounded-xl border border-[#25416b] bg-[#25416b] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#1b3152] dark:border-[#527bb8] dark:bg-[#527bb8] dark:text-stone-950"
              >
                Submit All Remaining
              </button>
            )}
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-xs font-semibold text-stone-700 transition-all hover:border-[#25416b] hover:text-[#1b3152] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-[#6894d4] dark:hover:text-[#acc4e8]"
            >
              Reset & Randomize Section
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
