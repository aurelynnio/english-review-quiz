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

export function ListeningSection({
  globalReviewMode,
}: {
  globalReviewMode: boolean;
}) {
  const [seed, setSeed] = useState<number>(606);
  const [mode, setMode] = useState<ListeningMode>("standard");
  const [submitted, setSubmitted] = useState(false);
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
    let correct = 0;

    preparedSubsections.forEach((sub) => {
      sub.shuffledTf.forEach((item) => {
        total++;
        if (submitted && tfAnswers[item.id] === item.correctAnswer) {
          correct++;
        }
      });

      sub.shuffledMc.forEach((item) => {
        total++;
        if (submitted) {
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
        if (
          submitted &&
          isFillBlankCorrect(gapTextAnswers[item.id] || "", item.correctAnswer)
        ) {
          correct++;
        }
      });
    });

    return { correct, total };
  }, [
    submitted,
    preparedSubsections,
    activeMode,
    tfAnswers,
    mcAnswers,
    gapTextAnswers,
  ]);

  const handleRetry = () => {
    setSubmitted(false);
    setTfAnswers({});
    setMcAnswers({});
    setGapTextAnswers({});
    setSeed(Math.floor(Math.random() * 100000) + 1);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-4 md:flex-row md:items-center dark:border-neutral-800/80">
          <div>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Section 6 • Texts 2, 9, 16, 53 & 54 (50 Questions)
            </span>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              6. Listening Practice
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Includes True/False verification with evidence notes and Gap-fill
              exercises (Multiple Choice & Fill in the Blanks).
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
          {preparedSubsections.map((sub, sIdx) => (
            <div
              key={sub.id}
              className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3.5 dark:border-neutral-800/80">
                <div>
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {sub.subtitle}
                  </span>
                  <h3 className="mt-0.5 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {sub.title}
                  </h3>
                </div>

                {sub.type === "gap-fill-text" && !submitted && (
                  <button
                    type="button"
                    onClick={() => setShowWordBankText16((w) => !w)}
                    className="rounded-xl border border-neutral-200/90 bg-neutral-50/70 px-3.5 py-1.5 text-xs font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
                  >
                    {showWordBankText16
                      ? "Hide Shuffled Word Bank"
                      : "Show Shuffled Word Bank"}
                  </button>
                )}
              </div>

              {/* Transcript / Context Paragraphs if present */}
              {sub.paragraphs && sub.paragraphs.length > 0 && (
                <div className="space-y-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-5 text-[15px] leading-relaxed text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950/70 dark:text-neutral-200">
                  {sub.paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              )}

              {/* TEXT 16 Full Passage Interactive Context + Randomized Questions */}
              {sub.fillBlankParagraphs && (
                <div className="space-y-3 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-5 text-[15px] leading-relaxed text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950/70 dark:text-neutral-200">
                  <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Full Transcript Context (TEXT 16: Cars)
                  </div>
                  {sub.fillBlankParagraphs.map((para, pIdx) => (
                    <p key={pIdx}>
                      <strong className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {para.speaker}:{" "}
                      </strong>
                      {para.segments.map((seg, segIdx) => {
                        if (!seg.blankNumber) {
                          return <span key={segIdx}>{seg.text}</span>;
                        }
                        const itemId = `t16-${seg.blankNumber}`;
                        const userVal = gapTextAnswers[itemId] || "";
                        const isRight =
                          submitted &&
                          isFillBlankCorrect(userVal, seg.answer || "");
                        return (
                          <span
                            key={segIdx}
                            className="mx-1 inline-flex items-baseline gap-1"
                          >
                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                              ({seg.blankNumber})
                            </span>
                            <input
                              type="text"
                              disabled={submitted}
                              value={userVal}
                              onChange={(e) =>
                                setGapTextAnswers((prev) => ({
                                  ...prev,
                                  [itemId]: e.target.value,
                                }))
                              }
                              placeholder="..."
                              className={`w-28 rounded-lg border px-2.5 py-0.5 text-xs transition-all focus:outline-none ${
                                !submitted
                                  ? "border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
                                  : isRight
                                  ? "border-green-400 bg-green-50 font-semibold text-green-900 dark:border-green-700 dark:bg-green-950/60 dark:text-green-200"
                                  : "border-red-400 bg-red-50 text-red-900 line-through dark:border-red-700 dark:bg-red-950/60 dark:text-red-200"
                              }`}
                            />
                            {submitted && !isRight && (
                              <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                                [{seg.answer}]
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </p>
                  ))}
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
                      submitted={submitted}
                      evidence={item.evidence}
                      reverseOptions={(seed + sIdx + idx) % 2 === 1}
                      onSelect={(val) =>
                        setTfAnswers((prev) => ({ ...prev, [item.id]: val }))
                      }
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

                    if (activeMode === "type-all-gaps") {
                      return (
                        <FillInTheBlankQuestion
                          key={item.id}
                          indexLabel={indexLabel}
                          headerBadge="Gap-Fill (Type)"
                          prompt={item.prompt}
                          userAnswer={gapTextAnswers[item.id] || ""}
                          correctAnswer={item.correctAnswer}
                          wordBank={sub.mcOptionsMap[item.id] || item.options}
                          submitted={submitted}
                          onChange={(val) =>
                            setGapTextAnswers((prev) => ({
                              ...prev,
                              [item.id]: val,
                            }))
                          }
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
                        submitted={submitted}
                        onSelect={(opt) =>
                          setMcAnswers((prev) => ({ ...prev, [item.id]: opt }))
                        }
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
                      submitted={submitted}
                      note={`Full sentence: ${item.fullSentence}`}
                      onChange={(val) =>
                        setGapTextAnswers((prev) => ({
                          ...prev,
                          [item.id]: val,
                        }))
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeMode !== "flashcard" && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-white px-6 py-4 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {submitted
              ? "Listening answers locked. Correct answers and evidence notes are displayed above."
              : "Complete the listening exercises above, then click Submit."}
          </span>
          <div className="flex items-center gap-3">
            {submitted ? (
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-xl border border-neutral-900 bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition-all hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Retry Listening Section
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="rounded-xl border border-neutral-900 bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition-all hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Submit Listening Section
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
