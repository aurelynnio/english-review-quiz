"use client";

import React, { useState, useEffect, useMemo } from "react";
import { LISTENING_SUBSECTIONS } from "@/data/questions";
import { seededShuffle } from "@/utils/quizUtils";
import { TrueFalseQuestion } from "@/components/questions/TrueFalseQuestion";
import { MultipleChoiceQuestion } from "@/components/questions/MultipleChoiceQuestion";
import {
  FillInTheBlankQuestion,
  isFillBlankCorrect,
} from "@/components/questions/FillInTheBlankQuestion";
import {
  FlashcardDeck,
  FlashcardItem,
} from "@/components/questions/FlashcardDeck";

type ListeningMode = "standard" | "type-all-gaps" | "flashcard";

const LISTENING_PALETTES = [
  {
    topBorder: "border-t-4 border-t-violet-500 dark:border-t-violet-400",
    badge:
      "border-violet-200/80 bg-violet-50 text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/50 dark:text-violet-300",
    dot: "bg-violet-500 dark:bg-violet-400",
    transcriptBox:
      "border-violet-200/80 border-l-4 border-l-violet-500 bg-violet-50/35 dark:border-violet-900/50 dark:border-l-violet-400 dark:bg-violet-950/20",
  },
  {
    topBorder: "border-t-4 border-t-sky-500 dark:border-t-sky-400",
    badge:
      "border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-300",
    dot: "bg-sky-500 dark:bg-sky-400",
    transcriptBox:
      "border-sky-200/80 border-l-4 border-l-sky-500 bg-sky-50/35 dark:border-sky-900/50 dark:border-l-sky-400 dark:bg-sky-950/20",
  },
  {
    topBorder: "border-t-4 border-t-amber-500 dark:border-t-amber-400",
    badge:
      "border-amber-200/80 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300",
    dot: "bg-amber-500 dark:bg-amber-400",
    transcriptBox:
      "border-amber-200/80 border-l-4 border-l-amber-500 bg-amber-50/35 dark:border-amber-900/50 dark:border-l-amber-400 dark:bg-amber-950/20",
  },
  {
    topBorder: "border-t-4 border-t-rose-500 dark:border-t-rose-400",
    badge:
      "border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-300",
    dot: "bg-rose-500 dark:bg-rose-400",
    transcriptBox:
      "border-rose-200/80 border-l-4 border-l-rose-500 bg-rose-50/35 dark:border-rose-900/50 dark:border-l-rose-400 dark:bg-rose-950/20",
  },
  {
    topBorder: "border-t-4 border-t-teal-500 dark:border-t-teal-400",
    badge:
      "border-teal-200/80 bg-teal-50 text-teal-700 dark:border-teal-800/60 dark:bg-teal-950/50 dark:text-teal-300",
    dot: "bg-teal-500 dark:bg-teal-400",
    transcriptBox:
      "border-teal-200/80 border-l-4 border-l-teal-500 bg-teal-50/35 dark:border-teal-900/50 dark:border-l-teal-400 dark:bg-teal-950/20",
  },
];

export function ListeningSection({
  globalReviewMode,
}: {
  globalReviewMode: boolean;
}) {
  const [seed, setSeed] = useState<number>(606);
  const [mode, setMode] = useState<ListeningMode>("standard");
  const [submittedIds, setSubmittedIds] = useState<Record<string, boolean>>({});
  const [showWordBankText16, setShowWordBankText16] = useState(false);

  const [tfAnswers, setTfAnswers] = useState<Record<string, boolean>>({});
  const [mcAnswers, setMcAnswers] = useState<Record<string, string>>({});
  const [gapTextAnswers, setGapTextAnswers] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 100000) + 1);
  }, []);

  const activeMode: ListeningMode = globalReviewMode ? "flashcard" : mode;

  const preparedSubsections = useMemo(() => {
    return LISTENING_SUBSECTIONS.map((sub, sIdx) => {
      const shuffledTf = sub.trueFalseItems
        ? seededShuffle(sub.trueFalseItems, seed + sIdx * 31)
        : [];
      const shuffledMc = sub.mcItems
        ? seededShuffle(sub.mcItems, seed + sIdx * 47)
        : [];
      const mcOptionsMap: Record<string, string[]> = {};
      shuffledMc.forEach((item, iIdx) => {
        mcOptionsMap[item.id] = seededShuffle(
          item.options,
          seed + sIdx * 59 + iIdx * 11
        );
      });
      const shuffledFill = sub.fillBlankItems
        ? seededShuffle(sub.fillBlankItems, seed + sIdx * 73)
        : [];
      const text16WordBank = sub.fillBlankItems
        ? seededShuffle(
            sub.fillBlankItems.map((b) => b.correctAnswer),
            seed + 888
          )
        : [];

      return {
        ...sub,
        shuffledTf,
        shuffledMc,
        mcOptionsMap,
        shuffledFill,
        text16WordBank,
      };
    });
  }, [seed]);

  const flashcards: FlashcardItem[] = useMemo(() => {
    const cards: FlashcardItem[] = [];
    preparedSubsections.forEach((sub) => {
      sub.shuffledTf.forEach((item) => {
        cards.push({
          id: item.id,
          label: `${sub.title.split(":")[0]} • #${item.number}`,
          frontTitle: `${sub.title} (True / False)`,
          frontText: item.statement,
          backAnswer: item.correctAnswer ? "True (T)" : "False (F)",
          backNote: item.evidence,
        });
      });
      sub.shuffledMc.forEach((item) => {
        cards.push({
          id: item.id,
          label: `${sub.title.split(":")[0]} • Gap (${item.number})`,
          frontTitle: sub.title,
          frontText: item.prompt,
          frontHint: `Choices: ${(
            sub.mcOptionsMap[item.id] || item.options
          ).join(" • ")}`,
          backAnswer: item.correctAnswer,
        });
      });
      sub.shuffledFill.forEach((item) => {
        cards.push({
          id: item.id,
          label: `TEXT 16 • Blank (${item.number})`,
          frontTitle: `${sub.title} — ${item.speaker}`,
          frontText: `${item.beforeText} (${item.number}) ______ ${item.afterText}`,
          backAnswer: item.correctAnswer,
          backNote: `Full sentence: ${item.fullSentence}`,
        });
      });
    });
    return cards;
  }, [preparedSubsections]);

  const scoreSummary = useMemo(() => {
    let total = 0;
    let submittedCount = 0;
    let correct = 0;

    preparedSubsections.forEach((sub) => {
      sub.shuffledTf.forEach((item) => {
        total++;
        if (submittedIds[item.id]) {
          submittedCount++;
          if (tfAnswers[item.id] === item.correctAnswer) {
            correct++;
          }
        }
      });

      sub.shuffledMc.forEach((item) => {
        total++;
        if (submittedIds[item.id]) {
          submittedCount++;
          if (activeMode === "type-all-gaps") {
            if (
              isFillBlankCorrect(
                gapTextAnswers[item.id] || "",
                item.correctAnswer
              )
            ) {
              correct++;
            }
          } else {
            if (mcAnswers[item.id] === item.correctAnswer) {
              correct++;
            }
          }
        }
      });

      sub.shuffledFill.forEach((item) => {
        total++;
        if (submittedIds[item.id]) {
          submittedCount++;
          if (
            isFillBlankCorrect(
              gapTextAnswers[item.id] || "",
              item.correctAnswer
            )
          ) {
            correct++;
          }
        }
      });
    });

    return { correct, submittedCount, total };
  }, [
    submittedIds,
    preparedSubsections,
    activeMode,
    tfAnswers,
    mcAnswers,
    gapTextAnswers,
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
    preparedSubsections.forEach((sub) => {
      sub.shuffledTf.forEach((item) => {
        next[item.id] = true;
      });
      sub.shuffledMc.forEach((item) => {
        next[item.id] = true;
      });
      sub.shuffledFill.forEach((item) => {
        next[item.id] = true;
      });
    });
    setSubmittedIds(next);
  };

  const handleRetry = () => {
    setSubmittedIds({});
    setTfAnswers({});
    setMcAnswers({});
    setGapTextAnswers({});
    setSeed(Math.floor(Math.random() * 100000) + 1);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-neutral-200/80 border-t-4 border-t-rose-500 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:border-t-rose-400 dark:bg-neutral-900">
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-4 md:flex-row md:items-center dark:border-neutral-800/80">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-300">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
              Section 6 • Texts 2, 9, 16, 53 & 54 (50 Questions)
            </span>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              6. Listening Practice
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Includes True/False verification with evidence notes and Gap-fill
              exercises. Submit each question individually for immediate
              feedback.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "standard", label: "Standard (T/F + Gap-Fill)" },
                { id: "type-all-gaps", label: "Type All Gap-Fills" },
                { id: "flashcard", label: "Flashcards" },
              ] as { id: ListeningMode; label: string }[]
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
                      ? "border-rose-600 bg-rose-600 text-white shadow-2xs dark:border-rose-500 dark:bg-rose-500 dark:text-white"
                      : "border-neutral-200/90 bg-neutral-50/70 text-neutral-700 hover:border-rose-300 hover:bg-rose-50/50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-rose-700 dark:hover:bg-rose-950/40"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeMode !== "flashcard" && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-200/80 bg-rose-50/50 px-4 py-3 dark:border-rose-800/60 dark:bg-rose-950/30">
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
                        : "text-rose-700 dark:text-rose-300"
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
                  className="rounded-xl border border-rose-600 bg-rose-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-2xs transition-all hover:bg-rose-700 dark:border-rose-500 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400"
                >
                  Submit All Remaining
                </button>
              )}
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-xl border border-rose-300 bg-white px-3.5 py-1.5 text-xs font-medium text-rose-700 transition-all hover:border-rose-600 hover:bg-rose-600 hover:text-white dark:border-rose-700 dark:bg-neutral-900 dark:text-rose-300 dark:hover:border-rose-500 dark:hover:bg-rose-500 dark:hover:text-white"
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
          {preparedSubsections.map((sub, sIdx) => {
            const palette =
              LISTENING_PALETTES[sIdx % LISTENING_PALETTES.length];
            const text16AllSubmitted =
              sub.fillBlankItems?.every((item) => submittedIds[item.id]) ??
              false;

            return (
              <div
                key={sub.id}
                className={`space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900 ${palette.topBorder}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3.5 dark:border-neutral-800/80">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${palette.badge}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${palette.dot}`}
                      />
                      {sub.subtitle}
                    </span>
                    <h3 className="mt-1.5 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {sub.title}
                    </h3>
                  </div>

                  {sub.type === "gap-fill-text" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowWordBankText16((w) => !w)}
                        className="rounded-xl border border-amber-300/90 bg-amber-50/70 px-3.5 py-1.5 text-xs font-medium text-amber-800 transition-all hover:border-amber-400 hover:bg-amber-100/70 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:border-amber-700 dark:hover:bg-amber-900/50"
                      >
                        {showWordBankText16
                          ? "Hide Shuffled Word Bank"
                          : "Show Shuffled Word Bank"}
                      </button>
                      {text16AllSubmitted ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSubmittedIds((prev) => {
                              const next = { ...prev };
                              sub.fillBlankItems?.forEach((item) => {
                                delete next[item.id];
                              });
                              return next;
                            });
                          }}
                          className="rounded-xl border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-700 transition-all hover:border-amber-500 hover:text-amber-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-amber-400 dark:hover:text-amber-300"
                        >
                          Try Transcript Blanks Again
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSubmittedIds((prev) => {
                              const next = { ...prev };
                              sub.fillBlankItems?.forEach((item) => {
                                next[item.id] = true;
                              });
                              return next;
                            });
                          }}
                          className="rounded-xl border border-amber-600 bg-amber-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-2xs transition-all hover:bg-amber-700 dark:border-amber-500 dark:bg-amber-500 dark:text-neutral-950 dark:hover:bg-amber-400"
                        >
                          Submit All 10 Blanks
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Transcript / Context Paragraphs if present */}
                {sub.paragraphs && sub.paragraphs.length > 0 && (
                  <div
                    className={`space-y-2.5 rounded-xl border p-5 text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-200 ${palette.transcriptBox}`}
                  >
                    {sub.paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                )}

                {/* TEXT 16 Full Passage Interactive Context + Randomized Questions */}
                {sub.fillBlankParagraphs && (
                  <div
                    className={`space-y-3 rounded-xl border p-5 text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-200 ${palette.transcriptBox}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                        Full Transcript Context (TEXT 16: Cars)
                      </span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        Tip: Press Enter inside any blank to submit it
                        immediately, or use the cards below.
                      </span>
                    </div>
                    {sub.fillBlankParagraphs.map((para, pIdx) => {
                      const isKate = para.speaker
                        .toLowerCase()
                        .includes("kate");
                      return (
                        <p key={pIdx} className="leading-8">
                          <span
                            className={`mr-2 inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${
                              isKate
                                ? "border-sky-200 bg-sky-100/80 text-sky-800 dark:border-sky-800/70 dark:bg-sky-900/50 dark:text-sky-300"
                                : "border-amber-200 bg-amber-100/80 text-amber-800 dark:border-amber-800/70 dark:bg-amber-900/50 dark:text-amber-300"
                            }`}
                          >
                            {para.speaker}
                          </span>
                          {para.segments.map((seg, segIdx) => {
                            if (!seg.blankNumber) {
                              return <span key={segIdx}>{seg.text}</span>;
                            }
                            const itemId = `t16-${seg.blankNumber}`;
                            const userVal = gapTextAnswers[itemId] || "";
                            const isBlankSubmitted = Boolean(
                              submittedIds[itemId]
                            );
                            const isRight =
                              isBlankSubmitted &&
                              isFillBlankCorrect(userVal, seg.answer || "");
                            return (
                              <span
                                key={segIdx}
                                className="mx-1 inline-flex items-baseline gap-1"
                              >
                                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                  ({seg.blankNumber})
                                </span>
                                <input
                                  type="text"
                                  disabled={isBlankSubmitted}
                                  value={userVal}
                                  onChange={(e) =>
                                    setGapTextAnswers((prev) => ({
                                      ...prev,
                                      [itemId]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      !isBlankSubmitted
                                    ) {
                                      e.preventDefault();
                                      handleSubmitOne(itemId);
                                    }
                                  }}
                                  placeholder="..."
                                  className={`w-28 rounded-lg border px-2.5 py-0.5 text-xs transition-all focus:outline-none ${
                                    !isBlankSubmitted
                                      ? "border-amber-300/90 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-amber-500 focus:bg-white dark:border-amber-800/70 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-amber-500 dark:focus:bg-neutral-900"
                                      : isRight
                                      ? "border-green-400 bg-green-50 font-semibold text-green-900 dark:border-green-700 dark:bg-green-950/60 dark:text-green-200"
                                      : "border-red-400 bg-red-50 text-red-900 line-through dark:border-red-700 dark:bg-red-950/60 dark:text-red-200"
                                  }`}
                                />
                                {isBlankSubmitted && !isRight && (
                                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                                    [{seg.answer}]
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </p>
                      );
                    })}
                  </div>
                )}

                {/* True / False Questions */}
                {sub.shuffledTf.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {sub.shuffledTf.map((item, idx) => (
                      <TrueFalseQuestion
                        key={item.id}
                        indexLabel={`Item ${idx + 1} of ${
                          sub.shuffledTf.length
                        } (Statement #${item.number})`}
                        headerBadge="True / False"
                        statement={item.statement}
                        selectedValue={tfAnswers[item.id]}
                        correctAnswer={item.correctAnswer}
                        submitted={Boolean(submittedIds[item.id])}
                        evidence={item.evidence}
                        reverseOptions={(seed + sIdx + idx) % 2 === 1}
                        onSelect={(val) =>
                          setTfAnswers((prev) => ({ ...prev, [item.id]: val }))
                        }
                        onSubmit={() => handleSubmitOne(item.id)}
                        onReset={() => handleResetOne(item.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Gap-Fill Multiple Choice (or Typed Gap-Fill) */}
                {sub.shuffledMc.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {sub.shuffledMc.map((item, idx) => {
                      const indexLabel = `Item ${idx + 1} of ${
                        sub.shuffledMc.length
                      } (Blank #${item.number})`;
                      const isItemSubmitted = Boolean(submittedIds[item.id]);

                      if (activeMode === "type-all-gaps") {
                        return (
                          <FillInTheBlankQuestion
                            key={item.id}
                            indexLabel={indexLabel}
                            headerBadge="Gap-Fill (Type)"
                            prompt={item.prompt}
                            userAnswer={gapTextAnswers[item.id] || ""}
                            correctAnswer={item.correctAnswer}
                            wordBank={
                              sub.mcOptionsMap[item.id] || item.options
                            }
                            submitted={isItemSubmitted}
                            onChange={(val) =>
                              setGapTextAnswers((prev) => ({
                                ...prev,
                                [item.id]: val,
                              }))
                            }
                            onSubmit={() => handleSubmitOne(item.id)}
                            onReset={() => handleResetOne(item.id)}
                          />
                        );
                      }

                      return (
                        <MultipleChoiceQuestion
                          key={item.id}
                          indexLabel={indexLabel}
                          headerBadge="Listening Gap-Fill"
                          prompt={item.prompt}
                          options={sub.mcOptionsMap[item.id] || item.options}
                          selectedOption={mcAnswers[item.id]}
                          correctAnswer={item.correctAnswer}
                          submitted={isItemSubmitted}
                          onSelect={(opt) =>
                            setMcAnswers((prev) => ({
                              ...prev,
                              [item.id]: opt,
                            }))
                          }
                          onSubmit={() => handleSubmitOne(item.id)}
                          onReset={() => handleResetOne(item.id)}
                        />
                      );
                    })}
                  </div>
                )}

                {/* TEXT 16 Randomized Individual Fill-in-the-Blank Cards */}
                {sub.shuffledFill.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {sub.shuffledFill.map((item, idx) => (
                      <FillInTheBlankQuestion
                        key={item.id}
                        indexLabel={`Item ${idx + 1} of ${
                          sub.shuffledFill.length
                        } (${item.speaker} • Blank #${item.number})`}
                        headerBadge="Fill in the Blank"
                        prompt={`${item.beforeText} ______ ${item.afterText}`}
                        userAnswer={gapTextAnswers[item.id] || ""}
                        correctAnswer={item.correctAnswer}
                        wordBank={
                          showWordBankText16 ? sub.text16WordBank : undefined
                        }
                        submitted={Boolean(submittedIds[item.id])}
                        note={`Full sentence: ${item.fullSentence}`}
                        onChange={(val) =>
                          setGapTextAnswers((prev) => ({
                            ...prev,
                            [item.id]: val,
                          }))
                        }
                        onSubmit={() => handleSubmitOne(item.id)}
                        onReset={() => handleResetOne(item.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeMode !== "flashcard" && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-white px-6 py-4 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {allSubmitted
              ? "All 50 listening questions have been submitted. Click Try Again on any card or Reset & Randomize."
              : `Submitted ${scoreSummary.submittedCount} of ${scoreSummary.total} listening questions. Submit each card individually or submit all remaining.`}
          </span>
          <div className="flex items-center gap-3">
            {!allSubmitted && (
              <button
                type="button"
                onClick={handleSubmitAll}
                className="rounded-xl border border-rose-600 bg-rose-600 px-5 py-2.5 text-xs font-medium text-white shadow-xs transition-all hover:bg-rose-700 dark:border-rose-500 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400"
              >
                Submit All Remaining
              </button>
            )}
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-xs font-medium text-neutral-700 transition-all hover:border-rose-500 hover:text-rose-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-rose-400 dark:hover:text-rose-300"
            >
              Reset & Randomize
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
