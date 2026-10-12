"use client";

import React, { useState, useEffect, useMemo } from "react";
import { READING_PASSAGES, MultipleChoiceItem } from "@/data/questions";
import { seededShuffle } from "@/utils/quizUtils";
import { MultipleChoiceQuestion } from "@/components/questions/MultipleChoiceQuestion";
import {
  FillInTheBlankQuestion,
  isFillBlankCorrect,
} from "@/components/questions/FillInTheBlankQuestion";
import { TrueFalseQuestion } from "@/components/questions/TrueFalseQuestion";
import {
  FlashcardDeck,
  FlashcardItem,
} from "@/components/questions/FlashcardDeck";

type ReadingMode =
  | "standard"
  | "mixed"
  | "fill-in-the-blank"
  | "true-false"
  | "flashcard";

const PASSAGE_PALETTES = [
  {
    topBorder: "border-t-4 border-t-indigo-500 dark:border-t-indigo-400",
    badge:
      "border-indigo-200/80 bg-indigo-50 text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/50 dark:text-indigo-300",
    dot: "bg-indigo-500 dark:bg-indigo-400",
    passageBox:
      "border-indigo-200/80 border-l-4 border-l-indigo-500 bg-indigo-50/35 dark:border-indigo-900/50 dark:border-l-indigo-400 dark:bg-indigo-950/20",
  },
  {
    topBorder: "border-t-4 border-t-teal-500 dark:border-t-teal-400",
    badge:
      "border-teal-200/80 bg-teal-50 text-teal-700 dark:border-teal-800/60 dark:bg-teal-950/50 dark:text-teal-300",
    dot: "bg-teal-500 dark:bg-teal-400",
    passageBox:
      "border-teal-200/80 border-l-4 border-l-teal-500 bg-teal-50/35 dark:border-teal-900/50 dark:border-l-teal-400 dark:bg-teal-950/20",
  },
  {
    topBorder: "border-t-4 border-t-violet-500 dark:border-t-violet-400",
    badge:
      "border-violet-200/80 bg-violet-50 text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/50 dark:text-violet-300",
    dot: "bg-violet-500 dark:bg-violet-400",
    passageBox:
      "border-violet-200/80 border-l-4 border-l-violet-500 bg-violet-50/35 dark:border-violet-900/50 dark:border-l-violet-400 dark:bg-violet-950/20",
  },
];

export function ReadingComprehensionSection({
  globalReviewMode,
}: {
  globalReviewMode: boolean;
}) {
  const [seed, setSeed] = useState<number>(505);
  const [mode, setMode] = useState<ReadingMode>("standard");
  const [submittedIds, setSubmittedIds] = useState<Record<string, boolean>>({});

  const [mcSelections, setMcSelections] = useState<Record<string, string>>({});
  const [fillInputs, setFillInputs] = useState<Record<string, string>>({});
  const [tfSelections, setTfSelections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 100000) + 1);
  }, []);

  const activeMode: ReadingMode = globalReviewMode ? "flashcard" : mode;

  const preparedPassages = useMemo(() => {
    return READING_PASSAGES.map((passage, pIdx) => {
      const shuffledQuestions = seededShuffle(
        passage.questions,
        seed + pIdx * 101
      );
      const optionsMap: Record<string, string[]> = {};
      const tfMap: Record<string, { statement: string; isTrue: boolean }> = {};

      shuffledQuestions.forEach((q, qIdx) => {
        optionsMap[q.id] = seededShuffle(
          q.options,
          seed + pIdx * 37 + qIdx * 13
        );
        const isTrue = (seed + pIdx + qIdx) % 2 === 0;
        const wrongOpts = q.options.filter((o) => o !== q.correctAnswer);
        const chosen = isTrue
          ? q.correctAnswer
          : seededShuffle(wrongOpts, seed + qIdx * 19)[0] ?? q.correctAnswer;
        tfMap[q.id] = {
          statement: `${q.prompt} → "${chosen}"`,
          isTrue,
        };
      });

      return {
        ...passage,
        shuffledQuestions,
        optionsMap,
        tfMap,
      };
    });
  }, [seed]);

  const flashcards: FlashcardItem[] = useMemo(() => {
    const list: FlashcardItem[] = [];
    preparedPassages.forEach((p) => {
      p.shuffledQuestions.forEach((q) => {
        list.push({
          id: q.id,
          label: `${p.title.split(":")[0]} • Q${q.number}`,
          frontTitle: p.title,
          frontText: q.prompt,
          frontHint: `Options: ${(p.optionsMap[q.id] || q.options).join(
            " • "
          )}`,
          backAnswer: q.correctAnswer,
        });
      });
    });
    return list;
  }, [preparedPassages]);

  const getQuestionFormat = (
    passageType: "comprehension" | "cloze",
    qIdx: number
  ): "multiple-choice" | "fill-in-the-blank" | "true-false" => {
    if (activeMode === "standard") {
      return "multiple-choice";
    }
    if (activeMode === "fill-in-the-blank") {
      return "fill-in-the-blank";
    }
    if (activeMode === "true-false") {
      return "true-false";
    }
    if (passageType === "cloze") {
      return qIdx % 2 === 0 ? "fill-in-the-blank" : "multiple-choice";
    }
    return qIdx % 2 === 0 ? "multiple-choice" : "true-false";
  };

  const evaluateQuestion = (
    q: MultipleChoiceItem,
    fmt: "multiple-choice" | "fill-in-the-blank" | "true-false",
    tfInfo: { statement: string; isTrue: boolean }
  ): boolean => {
    if (fmt === "multiple-choice") {
      return mcSelections[q.id] === q.correctAnswer;
    }
    if (fmt === "fill-in-the-blank") {
      return isFillBlankCorrect(fillInputs[q.id] || "", q.correctAnswer);
    }
    if (fmt === "true-false") {
      return tfSelections[q.id] === tfInfo.isTrue;
    }
    return false;
  };

  const scoreSummary = useMemo(() => {
    let total = 0;
    let submittedCount = 0;
    let correct = 0;

    preparedPassages.forEach((p) => {
      p.shuffledQuestions.forEach((q, qIdx) => {
        total++;
        if (submittedIds[q.id]) {
          submittedCount++;
          const fmt = getQuestionFormat(p.type, qIdx);
          if (evaluateQuestion(q, fmt, p.tfMap[q.id])) {
            correct++;
          }
        }
      });
    });

    return { correct, submittedCount, total };
  }, [
    submittedIds,
    preparedPassages,
    activeMode,
    mcSelections,
    fillInputs,
    tfSelections,
  ]);

  const allSubmitted =
    scoreSummary.total > 0 && scoreSummary.submittedCount === scoreSummary.total;

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
    preparedPassages.forEach((p) => {
      p.shuffledQuestions.forEach((q) => {
        next[q.id] = true;
      });
    });
    setSubmittedIds(next);
  };

  const handleRetry = () => {
    setSubmittedIds({});
    setMcSelections({});
    setFillInputs({});
    setTfSelections({});
    setSeed(Math.floor(Math.random() * 100000) + 1);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-neutral-200/80 border-t-4 border-t-teal-500 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:border-t-teal-400 dark:bg-neutral-900">
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800/80">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:border-teal-800/60 dark:bg-teal-950/50 dark:text-teal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 dark:bg-teal-400" />
              Section 5 • Passages 1, 2 & 3 (20 Questions)
            </span>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              5. Reading Comprehension
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Includes Passage 1 (Our School Newspaper), Passage 2
              (Whale-Watching Trip), and Passage 3 (The Art of Drawing — Cloze
              Test). Submit each question individually for immediate feedback.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "standard", label: "Multiple Choice" },
                { id: "mixed", label: "Mixed Formats" },
                { id: "fill-in-the-blank", label: "Fill in the Blank" },
                { id: "true-false", label: "True / False" },
                { id: "flashcard", label: "Flashcards" },
              ] as { id: ReadingMode; label: string }[]
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
                      ? "border-teal-600 bg-teal-600 text-white shadow-2xs dark:border-teal-500 dark:bg-teal-500 dark:text-white"
                      : "border-neutral-200/90 bg-neutral-50/70 text-neutral-700 hover:border-teal-300 hover:bg-teal-50/50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-teal-700 dark:hover:bg-teal-950/40"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeMode !== "flashcard" && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-teal-200/80 bg-teal-50/50 px-4 py-3 dark:border-teal-800/60 dark:bg-teal-950/30">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div>
                <span className="font-medium text-neutral-600 dark:text-neutral-400">
                  Progress:{" "}
                </span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
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
                        : "text-teal-700 dark:text-teal-300"
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
                  className="rounded-xl border border-teal-600 bg-teal-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-2xs transition-all hover:bg-teal-700 dark:border-teal-500 dark:bg-teal-500 dark:text-white dark:hover:bg-teal-400"
                >
                  Submit All Remaining
                </button>
              )}
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-xl border border-teal-300 bg-white px-3.5 py-1.5 text-xs font-medium text-teal-700 transition-all hover:border-teal-600 hover:bg-teal-600 hover:text-white dark:border-teal-700 dark:bg-neutral-900 dark:text-teal-300 dark:hover:border-teal-500 dark:hover:bg-teal-500 dark:hover:text-white"
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
      ) : (
        <div className="space-y-8">
          {preparedPassages.map((passage, pIdx) => {
            const palette =
              PASSAGE_PALETTES[pIdx % PASSAGE_PALETTES.length];
            return (
              <div
                key={passage.id}
                className={`space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900 ${palette.topBorder}`}
              >
                <div className="border-b border-neutral-100 pb-3.5 dark:border-neutral-800/80">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${palette.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${palette.dot}`} />
                    {passage.type === "cloze"
                      ? `Passage ${pIdx + 1} • Cloze Reading Test`
                      : `Passage ${pIdx + 1} • Reading Comprehension`}
                  </span>
                  <h3 className="mt-1.5 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {passage.title}
                  </h3>
                  {passage.subtitle && (
                    <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                      {passage.subtitle}
                    </p>
                  )}
                </div>

                {/* Passage Text */}
                <div
                  className={`space-y-3 rounded-xl border p-5 text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-200 ${palette.passageBox}`}
                >
                  {passage.paragraphs.map((para, paraIdx) => (
                    <p key={paraIdx}>{para}</p>
                  ))}
                </div>

                {/* Passage Questions */}
                <div className="space-y-4 pt-2">
                  {passage.shuffledQuestions.map((q, qIdx) => {
                    const fmt = getQuestionFormat(passage.type, qIdx);
                    const indexLabel = `${passage.title.split(":")[0]} • Item ${
                      qIdx + 1
                    } of ${passage.shuffledQuestions.length} (Original #${
                      q.number
                    })`;
                    const isItemSubmitted = Boolean(submittedIds[q.id]);

                    if (fmt === "fill-in-the-blank") {
                      return (
                        <FillInTheBlankQuestion
                          key={q.id}
                          indexLabel={indexLabel}
                          headerBadge="Fill in the Blank"
                          prompt={q.prompt}
                          userAnswer={fillInputs[q.id] || ""}
                          correctAnswer={q.correctAnswer}
                          wordBank={passage.optionsMap[q.id] || q.options}
                          submitted={isItemSubmitted}
                          onChange={(val) =>
                            setFillInputs((prev) => ({ ...prev, [q.id]: val }))
                          }
                          onSubmit={() => handleSubmitOne(q.id)}
                          onReset={() => handleResetOne(q.id)}
                        />
                      );
                    }

                    if (fmt === "true-false") {
                      const tf = passage.tfMap[q.id];
                      return (
                        <TrueFalseQuestion
                          key={q.id}
                          indexLabel={indexLabel}
                          headerBadge="True / False"
                          statement={tf.statement}
                          selectedValue={tfSelections[q.id]}
                          correctAnswer={tf.isTrue}
                          submitted={isItemSubmitted}
                          evidence={`Correct answer: "${q.correctAnswer}"`}
                          onSelect={(val) =>
                            setTfSelections((prev) => ({
                              ...prev,
                              [q.id]: val,
                            }))
                          }
                          onSubmit={() => handleSubmitOne(q.id)}
                          onReset={() => handleResetOne(q.id)}
                        />
                      );
                    }

                    return (
                      <MultipleChoiceQuestion
                        key={q.id}
                        indexLabel={indexLabel}
                        headerBadge="Multiple Choice"
                        prompt={q.prompt}
                        options={passage.optionsMap[q.id] || q.options}
                        selectedOption={mcSelections[q.id]}
                        correctAnswer={q.correctAnswer}
                        submitted={isItemSubmitted}
                        onSelect={(opt) =>
                          setMcSelections((prev) => ({ ...prev, [q.id]: opt }))
                        }
                        onSubmit={() => handleSubmitOne(q.id)}
                        onReset={() => handleResetOne(q.id)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeMode !== "flashcard" && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-white px-6 py-4 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {allSubmitted
              ? "All 20 reading questions have been submitted. Click Try Again on any question or Reset & Randomize."
              : `Submitted ${scoreSummary.submittedCount} of ${scoreSummary.total} reading questions. Submit each question individually or submit all remaining.`}
          </span>
          <div className="flex items-center gap-3">
            {!allSubmitted && (
              <button
                type="button"
                onClick={handleSubmitAll}
                className="rounded-xl border border-teal-600 bg-teal-600 px-5 py-2.5 text-xs font-medium text-white shadow-xs transition-all hover:bg-teal-700 dark:border-teal-500 dark:bg-teal-500 dark:text-white dark:hover:bg-teal-400"
              >
                Submit All Remaining
              </button>
            )}
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-xs font-medium text-neutral-700 transition-all hover:border-teal-500 hover:text-teal-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-teal-400 dark:hover:text-teal-300"
            >
              Reset & Randomize
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
