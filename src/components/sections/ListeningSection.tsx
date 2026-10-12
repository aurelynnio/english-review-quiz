"use client";

import React, { useState, useEffect, useMemo } from "react";
import { LISTENING_SUBSECTIONS, MultipleChoiceItem } from "@/data/questions";
import { seededShuffle } from "@/utils/quizUtils";
import { TrueFalseQuestion } from "@/components/questions/TrueFalseQuestion";
import { isFillBlankCorrect } from "@/components/questions/FillInTheBlankQuestion";
import {
  FlashcardDeck,
  FlashcardItem,
} from "@/components/questions/FlashcardDeck";

type ListeningMode = "standard" | "type-all-gaps" | "flashcard";

const OPTION_LETTERS = ["A", "B", "C", "D"];

const LISTENING_PALETTES = [
  {
    topBorder: "border-l-4 border-l-[#6e3556] dark:border-l-[#c97da8]",
    headerBand:
      "border-[#dfc2d2]/70 bg-gradient-to-r from-[#f7eff3]/85 via-[#f7eff3]/30 to-transparent dark:border-[#52243e]/50 dark:from-[#2a1521]/55 dark:via-[#2a1521]/20 dark:to-transparent",
    badge:
      "border-[#dfc2d2] bg-[#f7eff3] text-[#4f243d] dark:border-[#52243e] dark:bg-[#2a1521] dark:text-[#e6b8d2]",
    dot: "bg-[#6e3556] dark:bg-[#c97da8]",
    transcriptBox:
      "border-[#dfc2d2]/80 border-l-4 border-l-[#6e3556] bg-[#f7eff3]/35 dark:border-[#52243e]/60 dark:border-l-[#c97da8] dark:bg-[#2a1521]/20",
  },
  {
    topBorder: "border-l-4 border-l-[#25416b] dark:border-l-[#6894d4]",
    headerBand:
      "border-[#c5d4e8]/70 bg-gradient-to-r from-[#edf2f8]/85 via-[#edf2f8]/30 to-transparent dark:border-[#1e3559]/50 dark:from-[#132036]/55 dark:via-[#132036]/20 dark:to-transparent",
    badge:
      "border-[#c5d4e8] bg-[#edf2f8] text-[#1b3152] dark:border-[#1e3559] dark:bg-[#132036] dark:text-[#acc4e8]",
    dot: "bg-[#25416b] dark:bg-[#6894d4]",
    transcriptBox:
      "border-[#c5d4e8]/80 border-l-4 border-l-[#25416b] bg-[#edf2f8]/35 dark:border-[#1e3559]/60 dark:border-l-[#6894d4] dark:bg-[#132036]/20",
  },
  {
    topBorder: "border-l-4 border-l-[#a36c1d] dark:border-l-[#e0a84e]",
    headerBand:
      "border-[#e6cda5]/70 bg-gradient-to-r from-[#faf2e3]/85 via-[#faf2e3]/30 to-transparent dark:border-[#63410e]/50 dark:from-[#2b1f0d]/55 dark:via-[#2b1f0d]/20 dark:to-transparent",
    badge:
      "border-[#e6cda5] bg-[#faf2e3] text-[#784f12] dark:border-[#63410e] dark:bg-[#2b1f0d] dark:text-[#f2cf94]",
    dot: "bg-[#a36c1d] dark:bg-[#e0a84e]",
    transcriptBox:
      "border-[#e6cda5]/80 border-l-4 border-l-[#a36c1d] bg-[#faf2e3]/35 dark:border-[#63410e]/60 dark:border-l-[#e0a84e] dark:bg-[#2b1f0d]/20",
  },
  {
    topBorder: "border-l-4 border-l-[#9e3337] dark:border-l-[#d96266]",
    headerBand:
      "border-[#ebbfc1]/70 bg-gradient-to-r from-[#fcedee]/85 via-[#fcedee]/30 to-transparent dark:border-[#6e2124]/50 dark:from-[#2b1214]/55 dark:via-[#2b1214]/20 dark:to-transparent",
    badge:
      "border-[#ebbfc1] bg-[#fcedee] text-[#732124] dark:border-[#6e2124] dark:bg-[#2b1214] dark:text-[#f2a7aa]",
    dot: "bg-[#9e3337] dark:bg-[#d96266]",
    transcriptBox:
      "border-[#ebbfc1]/80 border-l-4 border-l-[#9e3337] bg-[#fcedee]/35 dark:border-[#6e2124]/60 dark:border-l-[#d96266] dark:bg-[#2b1214]/20",
  },
  {
    topBorder: "border-l-4 border-l-[#1f5c44] dark:border-l-[#43a07a]",
    headerBand:
      "border-[#b8decb]/70 bg-gradient-to-r from-[#ebf5f0]/85 via-[#ebf5f0]/30 to-transparent dark:border-[#1c4d39]/50 dark:from-[#11281f]/55 dark:via-[#11281f]/20 dark:to-transparent",
    badge:
      "border-[#b8decb] bg-[#ebf5f0] text-[#143d2d] dark:border-[#1c4d39] dark:bg-[#11281f] dark:text-[#6fd4aa]",
    dot: "bg-[#1f5c44] dark:bg-[#43a07a]",
    transcriptBox:
      "border-[#b8decb]/80 border-l-4 border-l-[#1f5c44] bg-[#ebf5f0]/35 dark:border-[#1c4d39]/60 dark:border-l-[#43a07a] dark:bg-[#11281f]/20",
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
        ? [...sub.mcItems].sort((a, b) => a.number - b.number)
        : [];
      const mcOptionsMap: Record<string, string[]> = {};
      shuffledMc.forEach((item) => {
        mcOptionsMap[item.id] = item.options;
      });
      const shuffledFill = sub.fillBlankItems
        ? [...sub.fillBlankItems].sort((a, b) => a.number - b.number)
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

  const renderGapFillParagraph = (
    para: string,
    questionsByNumber: Record<number, MultipleChoiceItem>
  ) => {
    const parts = para.split(/(\(\d+\)\s*______)/g);
    return parts.map((part, idx) => {
      const match = part.match(/^\((\d+)\)\s*______$/);
      if (!match) {
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      }
      const num = parseInt(match[1], 10);
      const q = questionsByNumber[num];
      if (!q) {
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      }

      const isSubmitted = Boolean(submittedIds[q.id]);
      const chosenText =
        activeMode === "type-all-gaps"
          ? (gapTextAnswers[q.id] || "").trim()
          : mcAnswers[q.id] || "";
      const isCorrect =
        isSubmitted &&
        (activeMode === "type-all-gaps"
          ? isFillBlankCorrect(gapTextAnswers[q.id] || "", q.correctAnswer)
          : mcAnswers[q.id] === q.correctAnswer);

      if (!isSubmitted) {
        return (
          <span
            key={idx}
            className={`mx-1 inline-flex items-baseline gap-1 rounded-md border px-2 py-0.5 font-mono text-xs font-bold transition-all ${
              chosenText
                ? "border-[#25416b] bg-[#25416b] text-white dark:border-[#6894d4] dark:bg-[#6894d4] dark:text-stone-950"
                : "border-[#c5d4e8] bg-white/90 text-[#1b3152] dark:border-[#1e3559] dark:bg-stone-900 dark:text-[#acc4e8]"
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

  return (
    <section className="space-y-6">
      <div className="studio-card overflow-hidden rounded-2xl border border-l-4 border-l-[#9e3337] dark:border-l-[#d96266]">
        <div className="border-b border-[#ebbfc1]/70 bg-gradient-to-r from-[#fcedee]/90 via-[#fcedee]/35 to-transparent px-6 py-5 dark:border-[#6e2124]/50 dark:from-[#2b1214]/60 dark:via-[#2b1214]/20 dark:to-transparent">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-md border border-[#ebbfc1] bg-[#fcedee] px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase text-[#732124] dark:border-[#6e2124] dark:bg-[#2b1214] dark:text-[#f2a7aa]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9e3337] dark:bg-[#d96266]" />
                Sec 06 • Texts 2, 9, 16, 53 & 54 (50 Questions)
              </span>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                6. Listening Practice
              </h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Includes True/False verification with evidence notes and compact
                1 → 10 Cloze / Gap-fill exercises. Submit each question
                individually for immediate feedback.
              </p>
            </div>

            <div className="studio-subcard flex flex-wrap items-center gap-1 rounded-xl border p-1">
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
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#9e3337] text-white shadow-2xs dark:bg-[#d96266] dark:text-stone-950"
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
                    className="h-full rounded-full bg-[#9e3337] transition-all duration-300 dark:bg-[#d96266]"
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
                <span className="font-mono text-xs font-bold text-[#732124] dark:text-[#f2a7aa]">
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
                        : "text-[#732124] dark:text-[#f2a7aa]"
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
                  className="rounded-xl border border-[#ebbfc1] bg-[#fcedee]/80 px-3.5 py-1.5 text-xs font-semibold text-[#732124] transition-all hover:bg-[#9e3337] hover:text-white dark:border-[#6e2124] dark:bg-[#2b1214] dark:text-[#f2a7aa] dark:hover:bg-[#d96266] dark:hover:text-stone-950"
                >
                  Submit All Remaining
                </button>
              )}
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-xl border border-[#9e3337] bg-[#9e3337] px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#7d2428] dark:border-[#d96266] dark:bg-[#d96266] dark:text-stone-950"
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
            const mcAllSubmitted =
              (sub.shuffledMc.length > 0 &&
                sub.shuffledMc.every((item) => submittedIds[item.id])) ??
              false;
            const mcByNumber: Record<number, MultipleChoiceItem> = {};
            sub.shuffledMc.forEach((item) => {
              mcByNumber[item.number] = item;
            });

            return (
              <div
                key={sub.id}
                className={`studio-card space-y-4 rounded-2xl border p-6 ${palette.topBorder}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/70 pb-3.5 dark:border-stone-800/80">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase ${palette.badge}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${palette.dot}`}
                      />
                      {sub.type === "gap-fill-mc"
                        ? `${sub.subtitle} (1 → ${sub.shuffledMc.length})`
                        : sub.subtitle}
                    </span>
                    <h3 className="font-display mt-2 text-xl font-bold text-stone-900 dark:text-stone-100">
                      {sub.title}
                    </h3>
                  </div>

                  {sub.type === "gap-fill-mc" && (
                    <div className="flex items-center gap-2">
                      {mcAllSubmitted ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSubmittedIds((prev) => {
                              const next = { ...prev };
                              sub.shuffledMc.forEach((item) => {
                                delete next[item.id];
                              });
                              return next;
                            });
                          }}
                          className="rounded-xl border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-700 transition-all hover:border-[#25416b] hover:text-[#1b3152] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                        >
                          Retry All (1→{sub.shuffledMc.length})
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSubmittedIds((prev) => {
                              const next = { ...prev };
                              sub.shuffledMc.forEach((item) => {
                                next[item.id] = true;
                              });
                              return next;
                            });
                          }}
                          className="rounded-xl border border-[#25416b] bg-[#25416b] px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#1b3152] dark:border-[#6894d4] dark:bg-[#6894d4] dark:text-stone-950"
                        >
                          Submit All (1→{sub.shuffledMc.length})
                        </button>
                      )}
                    </div>
                  )}

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
                          Retry All (1→10)
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
                          Submit All (1→10)
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Transcript / Context Paragraphs with interactive inline (1) ______ badges */}
                {sub.paragraphs && sub.paragraphs.length > 0 && (
                  <div
                    className={`space-y-2.5 rounded-xl border p-5 text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-200 ${palette.transcriptBox}`}
                  >
                    {sub.paragraphs.map((p, idx) => (
                      <p key={idx} className="leading-8">
                        {renderGapFillParagraph(p, mcByNumber)}
                      </p>
                    ))}
                  </div>
                )}

                {/* TEXT 16 Full Passage Interactive Context */}
                {sub.fillBlankParagraphs && (
                  <div
                    className={`space-y-3 rounded-xl border p-5 text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-200 ${palette.transcriptBox}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                        Full Transcript Context (TEXT 16: Cars)
                      </span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        Tip: Gõ trực tiếp vào chỗ trống (1)→(10) trong đoạn văn
                        hoặc ở bảng bên dưới rồi nhấn Enter.
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

                {/* Compact Cloze / Gap-Fill Multiple Choice Table (1 -> 10) like THE ART OF DRAWING */}
                {sub.shuffledMc.length > 0 && (
                  <div className="studio-subcard divide-y divide-stone-200/80 overflow-hidden rounded-xl border dark:divide-stone-800">
                    {sub.shuffledMc.map((item) => {
                      const opts = sub.mcOptionsMap[item.id] || item.options;
                      const isItemSubmitted = Boolean(submittedIds[item.id]);

                      if (activeMode === "type-all-gaps") {
                        const userVal = gapTextAnswers[item.id] || "";
                        const isCorrect =
                          isItemSubmitted &&
                          isFillBlankCorrect(userVal, item.correctAnswer);

                        return (
                          <div
                            key={item.id}
                            className="flex flex-col gap-2.5 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span
                                className={`inline-flex h-7 w-9 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold ${palette.badge}`}
                              >
                                ({item.number})
                              </span>
                              <input
                                type="text"
                                disabled={isItemSubmitted}
                                value={userVal}
                                onChange={(e) =>
                                  setGapTextAnswers((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    !isItemSubmitted &&
                                    userVal.trim()
                                  ) {
                                    e.preventDefault();
                                    handleSubmitOne(item.id);
                                  }
                                }}
                                placeholder={`Type word for (${item.number})...`}
                                className={`w-40 rounded-lg border px-2.5 py-1 text-xs font-medium focus:outline-none ${
                                  !isItemSubmitted
                                    ? "border-stone-300 bg-white text-stone-900 focus:border-[#25416b] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
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
                                      setGapTextAnswers((prev) => ({
                                        ...prev,
                                        [item.id]: opt,
                                      }))
                                    }
                                    className={`rounded-md border px-2 py-0.5 text-xs transition-all ${
                                      userVal.trim().toLowerCase() ===
                                      opt.toLowerCase()
                                        ? "border-[#25416b] bg-[#25416b] font-semibold text-white dark:border-[#6894d4] dark:bg-[#6894d4] dark:text-stone-950"
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
                                  Ans: {item.correctAnswer}
                                </span>
                              )}
                              {isItemSubmitted ? (
                                <button
                                  type="button"
                                  onClick={() => handleResetOne(item.id)}
                                  className="rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:border-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                                >
                                  Retry
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={!userVal.trim()}
                                  onClick={() => handleSubmitOne(item.id)}
                                  className="rounded-lg border border-[#25416b] bg-[#25416b] px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40 dark:border-[#6894d4] dark:bg-[#6894d4] dark:text-stone-950"
                                >
                                  Check
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      }

                      const selectedOpt = mcAnswers[item.id];
                      const isCorrect =
                        isItemSubmitted && selectedOpt === item.correctAnswer;

                      return (
                        <div
                          key={item.id}
                          className="flex flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center"
                        >
                          <span
                            className={`inline-flex h-7 w-9 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold ${palette.badge}`}
                          >
                            {item.number}.
                          </span>

                          <div className="grid flex-1 grid-cols-2 gap-1.5 sm:grid-cols-4">
                            {opts.map((opt, optIdx) => {
                              const letter =
                                OPTION_LETTERS[optIdx] || String(optIdx + 1);
                              const isSelected = selectedOpt === opt;
                              const isRightOpt = opt === item.correctAnswer;

                              let btnClass =
                                "border-stone-200/90 bg-white/90 text-stone-800 hover:border-[#25416b]/60 hover:bg-[#edf2f8]/50 dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-200 dark:hover:border-[#6894d4]/60";

                              if (!isItemSubmitted && isSelected) {
                                btnClass =
                                  "border-[#25416b] bg-[#25416b] text-white shadow-2xs dark:border-[#6894d4] dark:bg-[#6894d4] dark:text-stone-950";
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
                                    setMcAnswers((prev) => ({
                                      ...prev,
                                      [item.id]: opt,
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
                                  onClick={() => handleResetOne(item.id)}
                                  className="rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 transition-all hover:border-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                                >
                                  Retry
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                disabled={!selectedOpt}
                                onClick={() => handleSubmitOne(item.id)}
                                className="rounded-lg border border-[#25416b] bg-[#25416b] px-2.5 py-1 text-[11px] font-semibold text-white transition-all hover:bg-[#1b3152] disabled:cursor-not-allowed disabled:opacity-35 dark:border-[#6894d4] dark:bg-[#6894d4] dark:text-stone-950"
                              >
                                Check
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TEXT 16 Compact 1 -> 10 Fill-in-the-Blank Answer Table without repeated sentence cards */}
                {sub.shuffledFill.length > 0 && (
                  <div className="space-y-3">
                    {showWordBankText16 && (
                      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-amber-200/90 bg-amber-50/70 px-4 py-2.5 dark:border-amber-800/60 dark:bg-amber-950/30">
                        <span className="mr-1 font-mono text-[11px] font-bold uppercase text-amber-800 dark:text-amber-300">
                          Word Bank:
                        </span>
                        {sub.text16WordBank.map((w, wIdx) => (
                          <span
                            key={`${w}-${wIdx}`}
                            className="rounded-md border border-amber-300/80 bg-white px-2 py-0.5 font-mono text-xs font-semibold text-amber-900 dark:border-amber-700/70 dark:bg-stone-900 dark:text-amber-200"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="studio-subcard divide-y divide-stone-200/80 overflow-hidden rounded-xl border dark:divide-stone-800">
                      {sub.shuffledFill.map((item) => {
                        const userVal = gapTextAnswers[item.id] || "";
                        const isItemSubmitted = Boolean(submittedIds[item.id]);
                        const isCorrect =
                          isItemSubmitted &&
                          isFillBlankCorrect(userVal, item.correctAnswer);

                        return (
                          <div
                            key={item.id}
                            className="flex flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span
                                className={`inline-flex h-7 w-9 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold ${palette.badge}`}
                              >
                                {item.number}.
                              </span>
                              <span className="rounded-md border border-stone-200 bg-stone-100/80 px-2 py-0.5 font-mono text-[11px] font-semibold text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
                                {item.speaker}
                              </span>
                              <input
                                type="text"
                                disabled={isItemSubmitted}
                                value={userVal}
                                onChange={(e) =>
                                  setGapTextAnswers((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    !isItemSubmitted &&
                                    userVal.trim()
                                  ) {
                                    e.preventDefault();
                                    handleSubmitOne(item.id);
                                  }
                                }}
                                placeholder={`Type word for (${item.number})...`}
                                className={`w-44 rounded-lg border px-2.5 py-1 text-xs font-medium focus:outline-none ${
                                  !isItemSubmitted
                                    ? "border-stone-300 bg-white text-stone-900 focus:border-amber-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                                    : isCorrect
                                    ? "border-emerald-600 bg-emerald-50 font-bold text-emerald-900 dark:border-emerald-500/70 dark:bg-emerald-950/50 dark:text-emerald-200"
                                    : "border-rose-500 bg-rose-50 text-rose-900 line-through dark:border-rose-500/70 dark:bg-rose-950/50 dark:text-rose-200"
                                }`}
                              />
                              {showWordBankText16 && (
                                <div className="flex flex-wrap items-center gap-1">
                                  {sub.text16WordBank.map((opt, optIdx) => (
                                    <button
                                      key={`${opt}-${optIdx}`}
                                      type="button"
                                      disabled={isItemSubmitted}
                                      onClick={() =>
                                        setGapTextAnswers((prev) => ({
                                          ...prev,
                                          [item.id]: opt,
                                        }))
                                      }
                                      className={`rounded-md border px-2 py-0.5 text-xs transition-all ${
                                        userVal.trim().toLowerCase() ===
                                        opt.toLowerCase()
                                          ? "border-amber-600 bg-amber-600 font-semibold text-white dark:border-amber-500 dark:bg-amber-500 dark:text-stone-950"
                                          : "border-stone-200 bg-white/80 text-stone-600 hover:border-amber-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex shrink-0 items-center justify-end gap-2 self-end sm:self-center">
                              {isItemSubmitted && !isCorrect && (
                                <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                  Ans: {item.correctAnswer}
                                </span>
                              )}
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
                                    onClick={() => handleResetOne(item.id)}
                                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 transition-all hover:border-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                                  >
                                    Retry
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  disabled={!userVal.trim()}
                                  onClick={() => handleSubmitOne(item.id)}
                                  className="rounded-lg border border-amber-600 bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-all hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-35 dark:border-amber-500 dark:bg-amber-500 dark:text-stone-950"
                                >
                                  Check
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeMode !== "flashcard" && (
        <div className="studio-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-6 py-4">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {allSubmitted
              ? "All 50 listening questions have been submitted. Click Try Again on any card or Reset & Randomize."
              : `Submitted ${scoreSummary.submittedCount} of ${scoreSummary.total} listening questions. Submit each card individually or submit all remaining.`}
          </span>
          <div className="flex items-center gap-3">
            {!allSubmitted && (
              <button
                type="button"
                onClick={handleSubmitAll}
                className="rounded-xl border border-[#9e3337] bg-[#9e3337] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#7d2428] dark:border-[#d96266] dark:bg-[#d96266] dark:text-stone-950"
              >
                Submit All Remaining
              </button>
            )}
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-xs font-semibold text-stone-700 transition-all hover:border-[#9e3337] hover:text-[#732124] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-[#d96266] dark:hover:text-[#f2a7aa]"
            >
              Reset & Randomize
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
