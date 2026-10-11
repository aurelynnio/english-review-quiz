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

export function ReadingComprehensionSection({
  globalReviewMode,
}: {
  globalReviewMode: boolean;
}) {
  const [seed, setSeed] = useState<number>(505);
  const [mode, setMode] = useState<ReadingMode>("standard");
  const [submitted, setSubmitted] = useState(false);

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
    let correct = 0;

    preparedPassages.forEach((p) => {
      p.shuffledQuestions.forEach((q, qIdx) => {
        total++;
        if (submitted) {
          const fmt = getQuestionFormat(p.type, qIdx);
          if (evaluateQuestion(q, fmt, p.tfMap[q.id])) {
            correct++;
          }
        }
      });
    });

    return { correct, total };
  }, [
    submitted,
    preparedPassages,
    activeMode,
    mcSelections,
    fillInputs,
    tfSelections,
  ]);

  const handleRetry = () => {
    setSubmitted(false);
    setMcSelections({});
    setFillInputs({});
    setTfSelections({});
    setSeed(Math.floor(Math.random() * 100000) + 1);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800/80">
          <div>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Section 5 • Passages 1, 2 & 3 (20 Questions)
            </span>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              5. Reading Comprehension
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Includes Passage 1 (Our School Newspaper), Passage 2
              (Whale-Watching Trip), and Passage 3 (The Art of Drawing — Cloze
              Test).
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
      ) : (
        <div className="space-y-8">
          {preparedPassages.map((passage) => (
            <div
              key={passage.id}
              className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900"
            >
              <div className="border-b border-neutral-100 pb-3.5 dark:border-neutral-800/80">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {passage.type === "cloze"
                    ? "Cloze Reading Passage"
                    : "Reading Passage"}
                </span>
                <h3 className="mt-0.5 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {passage.title}
                </h3>
                {passage.subtitle && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {passage.subtitle}
                  </p>
                )}
              </div>

              {/* Passage Text */}
              <div className="space-y-3 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-5 text-[15px] leading-relaxed text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950/70 dark:text-neutral-200">
                {passage.paragraphs.map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
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
                        submitted={submitted}
                        onChange={(val) =>
                          setFillInputs((prev) => ({ ...prev, [q.id]: val }))
                        }
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
                        submitted={submitted}
                        evidence={`Correct answer: "${q.correctAnswer}"`}
                        onSelect={(val) =>
                          setTfSelections((prev) => ({ ...prev, [q.id]: val }))
                        }
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
                      submitted={submitted}
                      onSelect={(opt) =>
                        setMcSelections((prev) => ({ ...prev, [q.id]: opt }))
                      }
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeMode !== "flashcard" && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-white px-6 py-4 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {submitted
              ? "Answers are locked. Click Retry to randomize questions and options."
              : "Complete all 3 reading passages (20 questions), then click Submit."}
          </span>
          <div className="flex items-center gap-3">
            {submitted ? (
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-xl border border-neutral-900 bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition-all hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Retry Reading Comprehension
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="rounded-xl border border-neutral-900 bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition-all hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Submit Reading Comprehension
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
