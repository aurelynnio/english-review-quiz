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
      const shuffledQuestions =
        passage.type === "cloze"
          ? [...passage.questions].sort((a, b) => a.number - b.number)
          : seededShuffle(passage.questions, seed + pIdx * 101);
      const optionsMap: Record<string, string[]> = {};
      const tfMap: Record<string, { statement: string; isTrue: boolean }> = {};

      shuffledQuestions.forEach((q, qIdx) => {
        optionsMap[q.id] =
          passage.type === "cloze"
            ? q.options
            : seededShuffle(q.options, seed + pIdx * 37 + qIdx * 13);
        const isTrue = (seed + pIdx + qIdx) % 2 === 0;
        const wrongOpts = q.options.filter((o) => o !== q.correctAnswer);
        const chosen = isTrue
          ? q.correctAnswer
          : seededShuffle(wrongOpts, seed + qIdx * 19)[0] ?? q.correctAnswer;
        tfMap[q.id] = {
          statement:
            passage.type === "cloze"
              ? `Blank (${q.number}) → "${chosen}"`
              : `${q.prompt} → "${chosen}"`,
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

  const OPTION_LETTERS = ["A", "B", "C", "D"];

  const renderClozeParagraph = (
    para: string,
    questionsByNumber: Record<number, MultipleChoiceItem>
  ) => {
    const parts = para.split(/(\(\d+\)\s*_{3,})/g);
    return parts.map((part, idx) => {
      const match = part.match(/^\((\d+)\)\s*_{3,}$/);
      if (!match) {
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      }
      const num = parseInt(match[1], 10);
      const q = questionsByNumber[num];
      if (!q) {
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      }
      const qIdx = num - 1;
      const fmt = getQuestionFormat("cloze", qIdx);
      const isSubmitted = Boolean(submittedIds[q.id]);
      const chosenText =
        fmt === "fill-in-the-blank"
          ? (fillInputs[q.id] || "").trim()
          : mcSelections[q.id] || "";
      const isCorrect =
        isSubmitted &&
        (fmt === "fill-in-the-blank"
          ? isFillBlankCorrect(chosenText, q.correctAnswer)
          : fmt === "true-false"
          ? false
          : chosenText === q.correctAnswer);

      if (!isSubmitted) {
        return (
          <span
            key={idx}
            className={`mx-1 inline-flex items-baseline gap-1 rounded-md border px-2 py-0.5 font-mono text-xs font-bold transition-all ${
              chosenText
                ? "border-[#6e3556] bg-[#6e3556] text-white dark:border-[#c97da8] dark:bg-[#c97da8] dark:text-stone-950"
                : "border-[#dfc2d2] bg-white/90 text-[#4f243d] dark:border-[#52243e] dark:bg-stone-900 dark:text-[#e6b8d2]"
            }`}
          >
            <span>({num})</span>
            <span>{chosenText || "______"}</span>
          </span>
        );
      }

      return (
        <span
          key={idx}
          className={`mx-1 inline-flex items-baseline gap-1 rounded-md border px-2 py-0.5 font-mono text-xs font-bold ${
            isCorrect
              ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-500/70 dark:bg-emerald-950/60 dark:text-emerald-200"
              : "border-rose-500 bg-rose-50 text-rose-900 dark:border-rose-500/70 dark:bg-rose-950/60 dark:text-rose-200"
          }`}
        >
          <span>({num})</span>
          <span className={isCorrect ? "" : "line-through"}>
            {chosenText || "—"}
          </span>
          {!isCorrect && (
            <span className="ml-0.5 font-bold text-emerald-700 dark:text-emerald-300">
              [{q.correctAnswer}]
            </span>
          )}
        </span>
      );
    });
  };

  const renderComprehensionParagraph = (
    para: string,
    questions: MultipleChoiceItem[],
    tfMap: Record<string, { statement: string; isTrue: boolean }>
  ) => {
    const activeMatches: {
      start: number;
      end: number;
      q: MultipleChoiceItem;
      qIdx: number;
      isCorrect: boolean;
    }[] = [];

    questions.forEach((q, qIdx) => {
      if (!submittedIds[q.id] || !q.evidenceQuote) return;
      const pos = para.indexOf(q.evidenceQuote);
      if (pos === -1) return;
      const fmt = getQuestionFormat("comprehension", qIdx);
      const isCorrect = evaluateQuestion(q, fmt, tfMap[q.id]);
      activeMatches.push({
        start: pos,
        end: pos + q.evidenceQuote.length,
        q,
        qIdx,
        isCorrect,
      });
    });

    if (activeMatches.length === 0) {
      return para;
    }

    activeMatches.sort((a, b) => a.start - b.start);

    const nodes: React.ReactNode[] = [];
    let cursor = 0;

    activeMatches.forEach((m, idx) => {
      if (m.start < cursor) return;
      if (m.start > cursor) {
        nodes.push(
          <React.Fragment key={`txt-${idx}`}>
            {para.slice(cursor, m.start)}
          </React.Fragment>
        );
      }

      nodes.push(
        <mark
          key={`ev-${m.q.id}`}
          className={`mx-0.5 rounded-lg border px-1.5 py-0.5 font-medium text-inherit transition-all ${
            m.isCorrect
              ? "border-emerald-500/80 bg-emerald-100/90 text-emerald-950 dark:border-emerald-500/70 dark:bg-emerald-950/70 dark:text-emerald-100"
              : "border-rose-400/90 bg-amber-100/90 text-stone-950 dark:border-rose-500/70 dark:bg-rose-950/60 dark:text-amber-100"
          }`}
        >
          <span
            className={`mr-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase ${
              m.isCorrect
                ? "bg-emerald-700 text-white dark:bg-emerald-500 dark:text-stone-950"
                : "bg-rose-600 text-white dark:bg-rose-500 dark:text-white"
            }`}
          >
            Câu #{m.q.number} {m.isCorrect ? "✓" : "✗"}
          </span>
          <span className="underline decoration-dotted underline-offset-4">
            {para.slice(m.start, m.end)}
          </span>
        </mark>
      );

      cursor = m.end;
    });

    if (cursor < para.length) {
      nodes.push(
        <React.Fragment key="txt-end">{para.slice(cursor)}</React.Fragment>
      );
    }

    return nodes;
  };

  return (
    <section className="space-y-6">
      <div className="studio-card overflow-hidden rounded-2xl border border-l-4 border-l-[#1f5c44] dark:border-l-[#43a07a]">
        <div className="border-b border-[#b8decb]/70 bg-gradient-to-r from-[#ebf5f0]/90 via-[#ebf5f0]/35 to-transparent px-6 py-5 dark:border-[#1c4d39]/50 dark:from-[#11281f]/60 dark:via-[#11281f]/20 dark:to-transparent">
          <div className="flex flex-col justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-md border border-[#b8decb] bg-[#ebf5f0] px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase text-[#143d2d] dark:border-[#1c4d39] dark:bg-[#11281f] dark:text-[#6fd4aa]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1f5c44] dark:bg-[#43a07a]" />
                Sec 05 • Passages 1, 2 & 3 ({scoreSummary.total} Questions)
              </span>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                5. Reading Comprehension
              </h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Includes Passage 1 (Our School Newspaper), Passage 2
                (Whale-Watching Trip), and Passage 3 (The Art of Drawing — Cloze
                Test 1→10). Submit each question individually for immediate
                feedback.
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
            const questionsByNumber: Record<number, MultipleChoiceItem> = {};
            passage.shuffledQuestions.forEach((q) => {
              questionsByNumber[q.number] = q;
            });
            const allClozeSubmitted =
              passage.type === "cloze" &&
              passage.shuffledQuestions.every((q) => submittedIds[q.id]);

            const submittedComprehensionQuestions =
              passage.type === "comprehension"
                ? passage.shuffledQuestions
                    .map((q, qIdx) => ({ q, qIdx }))
                    .filter(({ q }) => Boolean(submittedIds[q.id]))
                    .sort((a, b) => a.q.number - b.q.number)
                : [];

            return (
              <div
                key={passage.id}
                className={`studio-card overflow-hidden rounded-2xl border ${palette.topBorder}`}
              >
                <div className={`border-b px-6 py-4 ${palette.headerBand}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase ${palette.badge}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${palette.dot}`}
                        />
                        {passage.type === "cloze"
                          ? `Passage ${pIdx + 1} • Cloze Test (1 → ${passage.shuffledQuestions.length})`
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

                    {passage.type === "cloze" && (
                      <div className="flex items-center gap-2">
                        {allClozeSubmitted ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSubmittedIds((prev) => {
                                const next = { ...prev };
                                passage.shuffledQuestions.forEach((q) => {
                                  delete next[q.id];
                                });
                                return next;
                              });
                            }}
                            className="rounded-xl border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-700 transition-all hover:border-[#6e3556] hover:text-[#4f243d] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                          >
                            Retry All (1→{passage.shuffledQuestions.length})
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSubmittedIds((prev) => {
                                const next = { ...prev };
                                passage.shuffledQuestions.forEach((q) => {
                                  next[q.id] = true;
                                });
                                return next;
                              });
                            }}
                            className="rounded-xl border border-[#6e3556] bg-[#6e3556] px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#532640] dark:border-[#c97da8] dark:bg-[#c97da8] dark:text-stone-950"
                          >
                            Submit All (1→{passage.shuffledQuestions.length})
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  {/* Passage Text */}
                  <div
                    className={`space-y-3.5 rounded-xl border p-5 text-[15.5px] leading-relaxed text-stone-800 dark:text-stone-200 ${palette.passageBox}`}
                  >
                    {passage.paragraphs.map((para, paraIdx) => (
                      <p key={paraIdx} className="leading-8">
                        {passage.type === "cloze"
                          ? renderClozeParagraph(para, questionsByNumber)
                          : renderComprehensionParagraph(
                              para,
                              passage.shuffledQuestions,
                              passage.tfMap
                            )}
                      </p>
                    ))}

                    {/* Top Evidence Summary Box inside the Reading Passage when questions are submitted */}
                    {submittedComprehensionQuestions.length > 0 && (
                      <div className="mt-4 space-y-2 border-t border-stone-300/70 pt-3.5 text-xs dark:border-stone-700/80">
                        <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                          Dẫn chứng trong bài đọc (
                          {submittedComprehensionQuestions.length}/
                          {passage.shuffledQuestions.length} câu đã nộp):
                        </div>
                        <div className="space-y-2">
                          {submittedComprehensionQuestions.map(
                            ({ q, qIdx }) => {
                              const fmt = getQuestionFormat(
                                "comprehension",
                                qIdx
                              );
                              const isCorrect = evaluateQuestion(
                                q,
                                fmt,
                                passage.tfMap[q.id]
                              );
                              return (
                                <div
                                  key={`top-ev-${q.id}`}
                                  className={`rounded-xl border px-3.5 py-2.5 leading-relaxed ${
                                    isCorrect
                                      ? "border-emerald-400/80 bg-emerald-50/85 text-emerald-950 dark:border-emerald-600/70 dark:bg-emerald-950/50 dark:text-emerald-100"
                                      : "border-rose-400/80 bg-rose-50/85 text-stone-900 dark:border-rose-600/70 dark:bg-rose-950/50 dark:text-rose-100"
                                  }`}
                                >
                                  <div className="flex flex-wrap items-center gap-2 font-semibold">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[11px] font-bold ${
                                        isCorrect
                                          ? "bg-emerald-700 text-white dark:bg-emerald-500 dark:text-stone-950"
                                          : "bg-rose-600 text-white dark:bg-rose-500 dark:text-white"
                                      }`}
                                    >
                                      Câu #{q.number} •{" "}
                                      {isCorrect ? "✓ Đúng" : "✗ Sai"}
                                    </span>
                                    <span className="text-stone-900 dark:text-stone-100">
                                      Đáp án đúng:{" "}
                                      <strong className="text-emerald-800 dark:text-emerald-300">
                                        {q.correctAnswer}
                                      </strong>
                                    </span>
                                  </div>
                                  {q.note && (
                                    <p className="mt-1 text-stone-700 dark:text-stone-200">
                                      {q.note}
                                    </p>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Compact Cloze Questions (1 -> 10) without repeating sentence prompts */}
                  {passage.type === "cloze" && activeMode !== "true-false" ? (
                    <div className="studio-subcard divide-y divide-stone-200/80 overflow-hidden rounded-xl border dark:divide-stone-800">
                      {passage.shuffledQuestions.map((q, qIdx) => {
                        const fmt = getQuestionFormat(passage.type, qIdx);
                        const opts = passage.optionsMap[q.id] || q.options;
                        const isItemSubmitted = Boolean(submittedIds[q.id]);

                        if (fmt === "fill-in-the-blank") {
                          const userVal = fillInputs[q.id] || "";
                          const isCorrect =
                            isItemSubmitted &&
                            isFillBlankCorrect(userVal, q.correctAnswer);

                          return (
                            <div
                              key={q.id}
                              className="flex flex-col gap-2.5 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className="inline-flex h-7 w-9 shrink-0 items-center justify-center rounded-lg border border-[#dfc2d2] bg-[#f7eff3] font-mono text-xs font-bold text-[#4f243d] dark:border-[#52243e] dark:bg-[#2a1521] dark:text-[#e6b8d2]">
                                  ({q.number})
                                </span>
                                <input
                                  type="text"
                                  disabled={isItemSubmitted}
                                  value={userVal}
                                  onChange={(e) =>
                                    setFillInputs((prev) => ({
                                      ...prev,
                                      [q.id]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      !isItemSubmitted &&
                                      userVal.trim()
                                    ) {
                                      e.preventDefault();
                                      handleSubmitOne(q.id);
                                    }
                                  }}
                                  placeholder={`Type word for (${q.number})...`}
                                  className={`w-36 rounded-lg border px-2.5 py-1 text-xs font-medium focus:outline-none ${
                                    !isItemSubmitted
                                      ? "border-stone-300 bg-white text-stone-900 focus:border-[#6e3556] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                                      : isCorrect
                                      ? "border-emerald-600 bg-emerald-50 font-bold text-emerald-900 dark:border-emerald-500/70 dark:bg-emerald-950/50 dark:text-emerald-200"
                                      : "border-rose-500 bg-rose-50 text-rose-900 line-through dark:border-rose-500/70 dark:bg-rose-950/50 dark:text-rose-200"
                                  }`}
                                />
                                <div className="flex flex-wrap items-center gap-1">
                                  {opts.map((opt) => (
                                    <button
                                      key={opt}
                                      type="button"
                                      disabled={isItemSubmitted}
                                      onClick={() =>
                                        setFillInputs((prev) => ({
                                          ...prev,
                                          [q.id]: opt,
                                        }))
                                      }
                                      className={`rounded-md border px-2 py-0.5 text-xs transition-all ${
                                        userVal.trim().toLowerCase() ===
                                        opt.toLowerCase()
                                          ? "border-[#6e3556] bg-[#6e3556] font-semibold text-white dark:border-[#c97da8] dark:bg-[#c97da8] dark:text-stone-950"
                                          : "border-stone-200 bg-white/80 text-stone-600 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                                {isItemSubmitted && !isCorrect && (
                                  <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                    Ans: {q.correctAnswer}
                                  </span>
                                )}
                                {isItemSubmitted ? (
                                  <button
                                    type="button"
                                    onClick={() => handleResetOne(q.id)}
                                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:border-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                                  >
                                    Retry
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={!userVal.trim()}
                                    onClick={() => handleSubmitOne(q.id)}
                                    className="rounded-lg border border-[#6e3556] bg-[#6e3556] px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40 dark:border-[#c97da8] dark:bg-[#c97da8] dark:text-stone-950"
                                  >
                                    Check
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        }

                        // Compact Multiple Choice Row (1 -> 10)
                        const selectedOpt = mcSelections[q.id];
                        const isCorrect =
                          isItemSubmitted && selectedOpt === q.correctAnswer;

                        return (
                          <div
                            key={q.id}
                            className="flex flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center"
                          >
                            <span className="inline-flex h-7 w-9 shrink-0 items-center justify-center rounded-lg border border-[#dfc2d2] bg-[#f7eff3] font-mono text-xs font-bold text-[#4f243d] dark:border-[#52243e] dark:bg-[#2a1521] dark:text-[#e6b8d2]">
                              {q.number}.
                            </span>

                            <div className="grid flex-1 grid-cols-2 gap-1.5 sm:grid-cols-4">
                              {opts.map((opt, optIdx) => {
                                const letter =
                                  OPTION_LETTERS[optIdx] || String(optIdx + 1);
                                const isSelected = selectedOpt === opt;
                                const isRightOpt = opt === q.correctAnswer;

                                let btnClass =
                                  "border-stone-200/90 bg-white/90 text-stone-800 hover:border-[#6e3556]/60 hover:bg-[#f7eff3]/50 dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-200 dark:hover:border-[#c97da8]/60";

                                if (!isItemSubmitted && isSelected) {
                                  btnClass =
                                    "border-[#6e3556] bg-[#6e3556] text-white shadow-2xs dark:border-[#c97da8] dark:bg-[#c97da8] dark:text-stone-950";
                                } else if (isItemSubmitted) {
                                  if (isRightOpt) {
                                    btnClass =
                                      "border-emerald-600 bg-emerald-50/95 font-bold text-emerald-950 dark:border-emerald-500/80 dark:bg-emerald-950/60 dark:text-emerald-100";
                                  } else if (isSelected && !isRightOpt) {
                                    btnClass =
                                      "border-rose-500 bg-rose-50/90 text-rose-950 line-through dark:border-rose-500/80 dark:bg-rose-950/50 dark:text-rose-200";
                                  } else {
                                    btnClass =
                                      "border-stone-200/60 bg-stone-100/50 text-stone-400 opacity-65 dark:border-stone-800/60 dark:bg-stone-900/40 dark:text-stone-500";
                                  }
                                }

                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    disabled={isItemSubmitted}
                                    onClick={() =>
                                      setMcSelections((prev) => ({
                                        ...prev,
                                        [q.id]: opt,
                                      }))
                                    }
                                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-all ${btnClass}`}
                                  >
                                    <span
                                      className={`font-mono text-[11px] font-bold ${
                                        !isItemSubmitted && isSelected
                                          ? "text-white/90 dark:text-stone-950"
                                          : isItemSubmitted && isRightOpt
                                          ? "text-emerald-700 dark:text-emerald-300"
                                          : "text-stone-400 dark:text-stone-500"
                                      }`}
                                    >
                                      {letter}.
                                    </span>
                                    <span className="truncate">{opt}</span>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="flex shrink-0 items-center justify-end gap-1.5 sm:w-24">
                              {isItemSubmitted ? (
                                <>
                                  <span
                                    className={`font-mono text-xs font-bold ${
                                      isCorrect
                                        ? "text-emerald-700 dark:text-emerald-400"
                                        : "text-rose-600 dark:text-rose-400"
                                    }`}
                                  >
                                    {isCorrect ? "✓" : "✗"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleResetOne(q.id)}
                                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 transition-all hover:border-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                                  >
                                    Retry
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  disabled={!selectedOpt}
                                  onClick={() => handleSubmitOne(q.id)}
                                  className="rounded-lg border border-[#6e3556] bg-[#6e3556] px-2.5 py-1 text-[11px] font-semibold text-white transition-all hover:bg-[#532640] disabled:cursor-not-allowed disabled:opacity-35 dark:border-[#c97da8] dark:bg-[#c97da8] dark:text-stone-950"
                                >
                                  Check
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Standard Passage Comprehension Questions */
                    <div className="space-y-4 pt-1">
                      {passage.shuffledQuestions.map((q, qIdx) => {
                        const fmt = getQuestionFormat(passage.type, qIdx);
                        const indexLabel = `${
                          passage.title.split(":")[0]
                        } • Câu #${q.number} (Item ${qIdx + 1} of ${
                          passage.shuffledQuestions.length
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
                              note={q.note}
                              onChange={(val) =>
                                setFillInputs((prev) => ({
                                  ...prev,
                                  [q.id]: val,
                                }))
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
                              evidence={
                                q.note
                                  ? `${q.note} (Đáp án đúng: "${q.correctAnswer}")`
                                  : `Correct answer: "${q.correctAnswer}"`
                              }
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
                            note={q.note}
                            onSelect={(opt) =>
                              setMcSelections((prev) => ({
                                ...prev,
                                [q.id]: opt,
                              }))
                            }
                            onSubmit={() => handleSubmitOne(q.id)}
                            onReset={() => handleResetOne(q.id)}
                          />
                        );
                      })}
                    </div>
                  )}
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
              ? `All ${scoreSummary.total} reading questions have been submitted. Click Retry on any question or Reset & Randomize.`
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
