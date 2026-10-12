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
    topBorder: "border-l-4 border-l-[#1f5c44] dark:border-l-[#43a07a]",
    headerBand:
      "border-[#b8decb]/70 bg-gradient-to-r from-[#ebf5f0]/85 via-[#ebf5f0]/30 to-transparent dark:border-[#1c4d39]/50 dark:from-[#11281f]/55 dark:via-[#11281f]/20 dark:to-transparent",
    badge:
      "border-[#b8decb] bg-[#ebf5f0] text-[#143d2d] dark:border-[#1c4d39] dark:bg-[#11281f] dark:text-[#6fd4aa]",
    dot: "bg-[#1f5c44] dark:bg-[#43a07a]",
    passageBox:
      "border-[#b8decb]/80 border-l-4 border-l-[#1f5c44] bg-[#ebf5f0]/30 dark:border-[#1c4d39]/60 dark:border-l-[#43a07a] dark:bg-[#11281f]/20",
  },
  {
    topBorder: "border-l-4 border-l-[#25416b] dark:border-l-[#6894d4]",
    headerBand:
      "border-[#c5d4e8]/70 bg-gradient-to-r from-[#edf2f8]/85 via-[#edf2f8]/30 to-transparent dark:border-[#1e3559]/50 dark:from-[#132036]/55 dark:via-[#132036]/20 dark:to-transparent",
    badge:
      "border-[#c5d4e8] bg-[#edf2f8] text-[#1b3152] dark:border-[#1e3559] dark:bg-[#132036] dark:text-[#acc4e8]",
    dot: "bg-[#25416b] dark:bg-[#6894d4]",
    passageBox:
      "border-[#c5d4e8]/80 border-l-4 border-l-[#25416b] bg-[#edf2f8]/35 dark:border-[#1e3559]/60 dark:border-l-[#6894d4] dark:bg-[#132036]/20",
  },
  {
    topBorder: "border-l-4 border-l-[#6e3556] dark:border-l-[#c97da8]",
    headerBand:
      "border-[#dfc2d2]/70 bg-gradient-to-r from-[#f7eff3]/85 via-[#f7eff3]/30 to-transparent dark:border-[#52243e]/50 dark:from-[#2a1521]/55 dark:via-[#2a1521]/20 dark:to-transparent",
    badge:
      "border-[#dfc2d2] bg-[#f7eff3] text-[#4f243d] dark:border-[#52243e] dark:bg-[#2a1521] dark:text-[#e6b8d2]",
    dot: "bg-[#6e3556] dark:bg-[#c97da8]",
    passageBox:
      "border-[#dfc2d2]/80 border-l-4 border-l-[#6e3556] bg-[#f7eff3]/35 dark:border-[#52243e]/60 dark:border-l-[#c97da8] dark:bg-[#2a1521]/20",
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
      <div className="studio-card overflow-hidden rounded-2xl border border-l-4 border-l-[#1f5c44] dark:border-l-[#43a07a]">
        <div className="border-b border-[#b8decb]/70 bg-gradient-to-r from-[#ebf5f0]/90 via-[#ebf5f0]/35 to-transparent px-6 py-5 dark:border-[#1c4d39]/50 dark:from-[#11281f]/60 dark:via-[#11281f]/20 dark:to-transparent">
          <div className="flex flex-col justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-md border border-[#b8decb] bg-[#ebf5f0] px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase text-[#143d2d] dark:border-[#1c4d39] dark:bg-[#11281f] dark:text-[#6fd4aa]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1f5c44] dark:bg-[#43a07a]" />
                Sec 05 • Passages 1, 2 & 3 (20 Questions)
              </span>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                5. Reading Comprehension
              </h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Includes Passage 1 (Our School Newspaper), Passage 2
                (Whale-Watching Trip), and Passage 3 (The Art of Drawing — Cloze
                Test). Submit each question individually for immediate feedback.
              </p>
            </div>

            <div className="studio-subcard flex flex-wrap items-center gap-1 rounded-xl border p-1">
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
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#1f5c44] text-white shadow-2xs dark:bg-[#43a07a] dark:text-stone-950"
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
                    className="h-full rounded-full bg-[#1f5c44] transition-all duration-300 dark:bg-[#43a07a]"
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
                <span className="font-mono text-xs font-bold text-[#143d2d] dark:text-[#6fd4aa]">
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
                        : "text-[#143d2d] dark:text-[#6fd4aa]"
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
                  className="rounded-xl border border-[#b8decb] bg-[#ebf5f0]/80 px-3.5 py-1.5 text-xs font-semibold text-[#143d2d] transition-all hover:bg-[#1f5c44] hover:text-white dark:border-[#1c4d39] dark:bg-[#11281f] dark:text-[#6fd4aa] dark:hover:bg-[#43a07a] dark:hover:text-stone-950"
                >
                  Submit All Remaining
                </button>
              )}
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-xl border border-[#1f5c44] bg-[#1f5c44] px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#143d2d] dark:border-[#43a07a] dark:bg-[#43a07a] dark:text-stone-950"
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
                className={`studio-card overflow-hidden rounded-2xl border ${palette.topBorder}`}
              >
                <div className={`border-b px-6 py-4 ${palette.headerBand}`}>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase ${palette.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${palette.dot}`} />
                    {passage.type === "cloze"
                      ? `Passage ${pIdx + 1} • Cloze Reading Test`
                      : `Passage ${pIdx + 1} • Reading Comprehension`}
                  </span>
                  <h3 className="font-display mt-2 text-xl font-bold text-stone-900 dark:text-stone-100">
                    {passage.title}
                  </h3>
                  {passage.subtitle && (
                    <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-400">
                      {passage.subtitle}
                    </p>
                  )}
                </div>

                <div className="space-y-5 p-6">
                  {/* Passage Text */}
                  <div
                    className={`space-y-3.5 rounded-xl border p-5 text-[15.5px] leading-relaxed text-stone-800 dark:text-stone-200 ${palette.passageBox}`}
                  >
                    {passage.paragraphs.map((para, paraIdx) => (
                      <p key={paraIdx}>{para}</p>
                    ))}
                  </div>

                  {/* Passage Questions */}
                  <div className="space-y-4 pt-1">
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
              </div>
            );
          })}
        </div>
      )}

      {activeMode !== "flashcard" && (
        <div className="studio-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-6 py-4">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {allSubmitted
              ? "All 20 reading questions have been submitted. Click Try Again on any question or Reset & Randomize."
              : `Submitted ${scoreSummary.submittedCount} of ${scoreSummary.total} reading questions. Submit each question individually or submit all remaining.`}
          </span>
          <div className="flex items-center gap-3">
            {!allSubmitted && (
              <button
                type="button"
                onClick={handleSubmitAll}
                className="rounded-xl border border-[#1f5c44] bg-[#1f5c44] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#143d2d] dark:border-[#43a07a] dark:bg-[#43a07a] dark:text-stone-950"
              >
                Submit All Remaining
              </button>
            )}
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-xs font-semibold text-stone-700 transition-all hover:border-[#1f5c44] hover:text-[#143d2d] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-[#43a07a] dark:hover:text-[#6fd4aa]"
            >
              Reset & Randomize
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
