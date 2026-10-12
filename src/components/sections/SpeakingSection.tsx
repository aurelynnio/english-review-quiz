"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SPEAKING_TOPICS, SpeakingTopic } from "@/data/questions";
import {
  seededShuffle,
  evaluateSpeakingAttempt,
  SpeakingAttemptRecord,
  SpeakingComparisonResult,
} from "@/utils/quizUtils";
import {
  FlashcardDeck,
  FlashcardItem,
} from "@/components/questions/FlashcardDeck";

const STORAGE_KEY = "english_review_speaking_attempts_v1";

type SpeakingMode = "study" | "practice" | "flashcard";

const TOPIC_PALETTES: Record<
  number,
  {
    topBorder: string;
    headerBand: string;
    badge: string;
    dot: string;
    modelBox: string;
    modelLabel: string;
    termBadge: string;
    fqCard: string;
    fqNumberPill: string;
    focusBorder: string;
  }
> = {
  33: {
    topBorder: "border-l-4 border-l-[#1f5c44] dark:border-l-[#43a07a]",
    headerBand:
      "border-[#b8decb]/70 bg-gradient-to-r from-[#ebf5f0]/85 via-[#ebf5f0]/30 to-transparent dark:border-[#1c4d39]/50 dark:from-[#11281f]/55 dark:via-[#11281f]/20 dark:to-transparent",
    badge:
      "border-[#b8decb] bg-[#ebf5f0] text-[#143d2d] dark:border-[#1c4d39] dark:bg-[#11281f] dark:text-[#6fd4aa]",
    dot: "bg-[#1f5c44] dark:bg-[#43a07a]",
    modelBox:
      "border-[#b8decb]/80 border-l-4 border-l-[#1f5c44] bg-[#ebf5f0]/35 dark:border-[#1c4d39]/60 dark:border-l-[#43a07a] dark:bg-[#11281f]/20",
    modelLabel: "text-[#143d2d] dark:text-[#6fd4aa]",
    termBadge:
      "border-[#b8decb] bg-[#ebf5f0] text-[#143d2d] dark:border-[#1c4d39] dark:bg-[#1a3b2e] dark:text-[#b2ead1]",
    fqCard:
      "border-[#b8decb]/60 bg-[#ebf5f0]/20 dark:border-[#1c4d39]/40 dark:bg-[#11281f]/15",
    fqNumberPill:
      "bg-[#1f5c44] text-white dark:bg-[#43a07a] dark:text-stone-950",
    focusBorder: "focus:border-[#1f5c44] dark:focus:border-[#43a07a]",
  },
  35: {
    topBorder: "border-l-4 border-l-[#25416b] dark:border-l-[#6894d4]",
    headerBand:
      "border-[#c5d4e8]/70 bg-gradient-to-r from-[#edf2f8]/85 via-[#edf2f8]/30 to-transparent dark:border-[#1e3559]/50 dark:from-[#132036]/55 dark:via-[#132036]/20 dark:to-transparent",
    badge:
      "border-[#c5d4e8] bg-[#edf2f8] text-[#1b3152] dark:border-[#1e3559] dark:bg-[#132036] dark:text-[#acc4e8]",
    dot: "bg-[#25416b] dark:bg-[#6894d4]",
    modelBox:
      "border-[#c5d4e8]/80 border-l-4 border-l-[#25416b] bg-[#edf2f8]/35 dark:border-[#1e3559]/60 dark:border-l-[#6894d4] dark:bg-[#132036]/20",
    modelLabel: "text-[#1b3152] dark:text-[#acc4e8]",
    termBadge:
      "border-[#c5d4e8] bg-[#edf2f8] text-[#1b3152] dark:border-[#1e3559] dark:bg-[#1b3152] dark:text-[#d5e3f7]",
    fqCard:
      "border-[#c5d4e8]/60 bg-[#edf2f8]/20 dark:border-[#1e3559]/40 dark:bg-[#132036]/15",
    fqNumberPill:
      "bg-[#25416b] text-white dark:bg-[#6894d4] dark:text-stone-950",
    focusBorder: "focus:border-[#25416b] dark:focus:border-[#6894d4]",
  },
  36: {
    topBorder: "border-l-4 border-l-[#a36c1d] dark:border-l-[#e0a84e]",
    headerBand:
      "border-[#e6cda5]/70 bg-gradient-to-r from-[#faf2e3]/85 via-[#faf2e3]/30 to-transparent dark:border-[#63410e]/50 dark:from-[#2b1f0d]/55 dark:via-[#2b1f0d]/20 dark:to-transparent",
    badge:
      "border-[#e6cda5] bg-[#faf2e3] text-[#784f12] dark:border-[#63410e] dark:bg-[#2b1f0d] dark:text-[#f2cf94]",
    dot: "bg-[#a36c1d] dark:bg-[#e0a84e]",
    modelBox:
      "border-[#e6cda5]/80 border-l-4 border-l-[#a36c1d] bg-[#faf2e3]/35 dark:border-[#63410e]/60 dark:border-l-[#e0a84e] dark:bg-[#2b1f0d]/20",
    modelLabel: "text-[#784f12] dark:text-[#f2cf94]",
    termBadge:
      "border-[#e6cda5] bg-[#faf2e3] text-[#784f12] dark:border-[#63410e] dark:bg-[#3d2b11] dark:text-[#f7deb2]",
    fqCard:
      "border-[#e6cda5]/60 bg-[#faf2e3]/25 dark:border-[#63410e]/40 dark:bg-[#2b1f0d]/15",
    fqNumberPill:
      "bg-[#a36c1d] text-white dark:bg-[#e0a84e] dark:text-stone-950",
    focusBorder: "focus:border-[#a36c1d] dark:focus:border-[#e0a84e]",
  },
};

export function SpeakingSection({
  globalReviewMode,
}: {
  globalReviewMode: boolean;
}) {
  const [seed, setSeed] = useState<number>(202);
  const [mode, setMode] = useState<SpeakingMode>("practice");
  const [userDrafts, setUserDrafts] = useState<Record<string, string>>({});
  const [followUpNotes, setFollowUpNotes] = useState<Record<string, string>>(
    {}
  );
  const [submittedTopics, setSubmittedTopics] = useState<
    Record<string, boolean>
  >({});
  const [savedAttempts, setSavedAttempts] = useState<SpeakingAttemptRecord[]>(
    []
  );
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 100000) + 1);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedAttempts(parsed);
        }
      }
    } catch {
      // ignore localStorage read errors
    }
  }, []);

  const activeMode: SpeakingMode = globalReviewMode ? "flashcard" : mode;

  const randomizedTopics = useMemo(
    () => seededShuffle(SPEAKING_TOPICS, seed),
    [seed]
  );

  const evaluations: Record<string, SpeakingComparisonResult> = useMemo(() => {
    const map: Record<string, SpeakingComparisonResult> = {};
    randomizedTopics.forEach((topic) => {
      if (submittedTopics[topic.id]) {
        map[topic.id] = evaluateSpeakingAttempt(
          userDrafts[topic.id] || "",
          topic.modelAnswer
        );
      }
    });
    return map;
  }, [submittedTopics, randomizedTopics, userDrafts]);

  const progressSummary = useMemo(() => {
    const total = randomizedTopics.length;
    const submittedList = randomizedTopics.filter(
      (t) => submittedTopics[t.id]
    );
    const submittedCount = submittedList.length;
    const avgSim =
      submittedCount > 0
        ? Math.round(
            submittedList.reduce(
              (acc, t) => acc + (evaluations[t.id]?.similarityPercent ?? 0),
              0
            ) / submittedCount
          )
        : 0;
    return {
      submittedCount,
      total,
      allSubmitted: total > 0 && submittedCount === total,
      averageSimilarity: avgSim,
    };
  }, [randomizedTopics, submittedTopics, evaluations]);

  const saveTopicRecordsToStorage = (topicsToSave: SpeakingTopic[]) => {
    const newRecords: SpeakingAttemptRecord[] = [];
    const nowStr = new Date().toLocaleString();

    topicsToSave.forEach((topic) => {
      const text = (userDrafts[topic.id] || "").trim();
      const result = evaluateSpeakingAttempt(text, topic.modelAnswer);
      if (text.length > 0) {
        newRecords.push({
          id: `${topic.id}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 6)}`,
          topicId: topic.id,
          topicTitle: topic.title,
          userAnswer: text,
          similarityPercent: result.similarityPercent,
          missingKeywords: result.missingKeywords,
          differentWording: result.differentWording,
          timestamp: nowStr,
        });
      }
    });

    if (newRecords.length > 0) {
      const updated = [...newRecords, ...savedAttempts].slice(0, 50);
      setSavedAttempts(updated);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore localStorage write errors
      }
    }
  };

  const handleSubmitTopic = (topic: SpeakingTopic) => {
    setSubmittedTopics((prev) => ({ ...prev, [topic.id]: true }));
    saveTopicRecordsToStorage([topic]);
  };

  const handleResetTopic = (topicId: string) => {
    setSubmittedTopics((prev) => {
      const next = { ...prev };
      delete next[topicId];
      return next;
    });
  };

  const handleSubmitAll = () => {
    const unsubmitted = randomizedTopics.filter((t) => !submittedTopics[t.id]);
    const next: Record<string, boolean> = {};
    randomizedTopics.forEach((t) => {
      next[t.id] = true;
    });
    setSubmittedTopics(next);
    if (unsubmitted.length > 0) {
      saveTopicRecordsToStorage(unsubmitted);
    }
  };

  const handleRetry = () => {
    setSubmittedTopics({});
    setUserDrafts({});
    setFollowUpNotes({});
    setSeed(Math.floor(Math.random() * 100000) + 1);
  };

  const handleClearHistory = () => {
    setSavedAttempts([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const flashcards: FlashcardItem[] = useMemo(() => {
    const cards: FlashcardItem[] = [];
    randomizedTopics.forEach((topic) => {
      cards.push({
        id: `${topic.id}-main`,
        label: `Topic ${topic.topicNumber}`,
        frontTitle: "Speaking Sample Topic",
        frontText: topic.title,
        frontHint: `Key focus: ${topic.highlightedTerm} (${topic.followUpQuestions.length} follow-up questions)`,
        backAnswer: topic.modelAnswer,
        backNote: `Follow-up questions: ${topic.followUpQuestions.join(" | ")}`,
      });
    });
    return cards;
  }, [randomizedTopics]);

  return (
    <section className="space-y-6">
      <div className="studio-card overflow-hidden rounded-2xl border border-l-4 border-l-[#6e3556] dark:border-l-[#c97da8]">
        <div className="border-b border-[#dfc2d2]/70 bg-gradient-to-r from-[#f7eff3]/90 via-[#f7eff3]/35 to-transparent px-6 py-5 dark:border-[#52243e]/50 dark:from-[#2a1521]/60 dark:via-[#2a1521]/20 dark:to-transparent">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-md border border-[#dfc2d2] bg-[#f7eff3] px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase text-[#4f243d] dark:border-[#52243e] dark:bg-[#2a1521] dark:text-[#e6b8d2]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6e3556] dark:bg-[#c97da8]" />
                Sec 02 • Topics 33, 35, 36
              </span>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                2. Speaking — Sample Topics
              </h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Study the model answers and follow-up questions, or switch to
                Practice Mode to type from memory and evaluate each topic
                individually.
              </p>
            </div>

            <div className="studio-subcard flex flex-wrap items-center gap-1 rounded-xl border p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("study");
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeMode === "study"
                    ? "bg-[#6e3556] text-white shadow-2xs dark:bg-[#b56291] dark:text-white"
                    : "text-stone-600 hover:bg-white/70 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800/70"
                }`}
              >
                Study Mode (Model Shown)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("practice");
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeMode === "practice"
                    ? "bg-[#6e3556] text-white shadow-2xs dark:bg-[#b56291] dark:text-white"
                    : "text-stone-600 hover:bg-white/70 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800/70"
                }`}
              >
                Practice Mode (Model Hidden)
              </button>
              <button
                type="button"
                onClick={() => setMode("flashcard")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeMode === "flashcard"
                    ? "bg-[#6e3556] text-white shadow-2xs dark:bg-[#b56291] dark:text-white"
                    : "text-stone-600 hover:bg-white/70 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800/70"
                }`}
              >
                Flashcards
              </button>
              <button
                type="button"
                onClick={() => setShowHistory((h) => !h)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  showHistory
                    ? "bg-[#a36c1d] text-white shadow-2xs dark:bg-[#e0a84e] dark:text-stone-950"
                    : "text-stone-600 hover:bg-white/70 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800/70"
                }`}
              >
                Saved Attempts ({savedAttempts.length})
              </button>
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
                    className="h-full rounded-full bg-[#6e3556] transition-all duration-300 dark:bg-[#c97da8]"
                    style={{
                      width: `${
                        progressSummary.total > 0
                          ? Math.round(
                              (progressSummary.submittedCount /
                                progressSummary.total) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="font-mono text-xs font-bold text-[#4f243d] dark:text-[#e6b8d2]">
                  {progressSummary.submittedCount}/{progressSummary.total} Topics
                </span>
              </div>
              {progressSummary.submittedCount > 0 && (
                <div className="flex items-center gap-2 border-l border-stone-200 pl-4 dark:border-stone-800">
                  <span className="font-mono text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
                    Avg Similarity:
                  </span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      progressSummary.averageSimilarity >= 80
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-[#4f243d] dark:text-[#e6b8d2]"
                    }`}
                  >
                    {progressSummary.averageSimilarity}%
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!progressSummary.allSubmitted && (
                <button
                  type="button"
                  onClick={handleSubmitAll}
                  className="rounded-xl border border-[#dfc2d2] bg-[#f7eff3]/80 px-3.5 py-1.5 text-xs font-semibold text-[#4f243d] transition-all hover:bg-[#6e3556] hover:text-white dark:border-[#52243e] dark:bg-[#2a1521] dark:text-[#e6b8d2] dark:hover:bg-[#b56291] dark:hover:text-white"
                >
                  Submit All Remaining
                </button>
              )}
              {progressSummary.submittedCount > 0 && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="rounded-xl border border-[#6e3556] bg-[#6e3556] px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#542741] dark:border-[#c97da8] dark:bg-[#b56291]"
                >
                  Reset & Randomize
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Saved Attempts Drawer */}
      {showHistory && (
        <div className="studio-card rounded-2xl border border-l-4 border-l-[#a36c1d] p-6 dark:border-l-[#e0a84e]">
          <div className="mb-4 flex items-center justify-between border-b border-stone-200/70 pb-3.5 dark:border-stone-800">
            <div>
              <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                Saved Speaking Attempts (localStorage)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Past practice submissions stored locally in your browser for
                review.
              </p>
            </div>
            {savedAttempts.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="rounded-lg border border-stone-200 px-3 py-1 text-xs font-semibold text-stone-700 transition-all hover:border-rose-400 hover:text-rose-700 dark:border-stone-700 dark:text-stone-300"
              >
                Clear Saved History
              </button>
            )}
          </div>

          {savedAttempts.length === 0 ? (
            <p className="text-xs text-stone-500 dark:text-stone-400">
              No speaking attempts saved yet. Type an answer on any topic card
              and click Submit Topic to record your attempt.
            </p>
          ) : (
            <div className="space-y-3">
              {savedAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="studio-subcard rounded-xl border p-4 text-xs"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/70 pb-2 dark:border-stone-800">
                    <span className="font-semibold text-[#6e3556] dark:text-[#e6b8d2]">
                      {attempt.topicTitle}
                    </span>
                    <div className="flex items-center gap-3 font-mono">
                      <span
                        className={
                          attempt.similarityPercent >= 75
                            ? "font-bold text-emerald-700 dark:text-emerald-400"
                            : "font-bold text-rose-700 dark:text-rose-400"
                        }
                      >
                        Similarity: {attempt.similarityPercent}%
                      </span>
                      <span className="text-stone-500 dark:text-stone-400">
                        {attempt.timestamp}
                      </span>
                    </div>
                  </div>
                  <p className="mb-2 text-sm text-stone-800 dark:text-stone-200">
                    {attempt.userAnswer}
                  </p>
                  {attempt.missingKeywords.length > 0 && (
                    <div className="mt-1">
                      <span className="font-semibold text-rose-700 dark:text-rose-400">
                        Missing Key Words:{" "}
                      </span>
                      <span className="text-stone-700 dark:text-stone-300">
                        {attempt.missingKeywords.join(", ")}
                      </span>
                    </div>
                  )}
                  {attempt.differentWording.length > 0 && (
                    <div className="mt-1">
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        Different Wording:{" "}
                      </span>
                      <span className="text-stone-700 dark:text-stone-300">
                        {attempt.differentWording.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeMode === "flashcard" ? (
        <FlashcardDeck
          cards={flashcards}
          onShuffle={() => setSeed(Math.floor(Math.random() * 100000) + 1)}
        />
      ) : (
        <div className="space-y-6">
          {randomizedTopics.map((topic: SpeakingTopic, idx) => {
            const isTopicSubmitted = Boolean(submittedTopics[topic.id]);
            const evalResult = evaluations[topic.id];
            const showModelAnswer = activeMode === "study" || isTopicSubmitted;
            const palette =
              TOPIC_PALETTES[topic.topicNumber] ?? TOPIC_PALETTES[33];

            return (
              <div
                key={topic.id}
                className={`studio-card overflow-hidden rounded-2xl border ${palette.topBorder}`}
              >
                <div
                  className={`flex flex-wrap items-center justify-between gap-2 border-b px-6 py-4 ${palette.headerBand}`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase ${palette.badge}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${palette.dot}`}
                        />
                        Topic {idx + 1} of {randomizedTopics.length} (Topic #
                        {topic.topicNumber})
                      </span>
                      <span
                        className={`rounded-md border px-2.5 py-0.5 font-mono text-[11px] font-bold ${palette.termBadge}`}
                      >
                        Focus: {topic.highlightedTerm}
                      </span>
                    </div>
                    <h3 className="font-display mt-2 text-xl font-bold text-stone-900 dark:text-stone-100">
                      {topic.title}
                    </h3>
                  </div>

                  {isTopicSubmitted && evalResult && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md border px-3 py-1 font-mono text-xs font-bold uppercase ${
                          evalResult.similarityPercent >= 75
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                        }`}
                      >
                        Similarity: {evalResult.similarityPercent}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Model Answer Box */}
                  {showModelAnswer ? (
                    <div
                      className={`mb-5 rounded-xl border p-4 ${palette.modelBox}`}
                    >
                      <div
                        className={`mb-1.5 font-mono text-xs font-bold uppercase ${palette.modelLabel}`}
                      >
                        Model Answer (Topic #{topic.topicNumber})
                      </div>
                      <p className="text-[15px] leading-relaxed text-stone-900 dark:text-stone-100">
                        {topic.modelAnswer
                          .split(topic.highlightedTerm)
                          .map((part, pIdx, arr) => (
                            <React.Fragment key={pIdx}>
                              {part}
                              {pIdx < arr.length - 1 && (
                                <strong
                                  className={`rounded-md border px-1.5 py-0.5 font-semibold ${palette.termBadge}`}
                                >
                                  {topic.highlightedTerm}
                                </strong>
                              )}
                            </React.Fragment>
                          ))}
                      </p>
                    </div>
                  ) : (
                    <div
                      className={`mb-5 rounded-xl border border-dashed px-4 py-3 text-xs ${palette.fqCard} ${palette.modelLabel}`}
                    >
                      Model answer is hidden in Practice Mode. Type your response
                      from memory below and click Submit Topic #{topic.topicNumber}{" "}
                      to compare.
                    </div>
                  )}

                  {/* Memory Recall Textarea */}
                  <div className="mb-4">
                    <label className="mb-2 block font-mono text-xs font-bold uppercase text-stone-700 dark:text-stone-300">
                      Your Speaking Response (Type from memory)
                    </label>
                    <textarea
                      rows={5}
                      disabled={isTopicSubmitted}
                      value={userDrafts[topic.id] || ""}
                      onChange={(e) =>
                        setUserDrafts((prev) => ({
                          ...prev,
                          [topic.id]: e.target.value,
                        }))
                      }
                      placeholder={`Write the speech for "${topic.title}" from memory...`}
                      className={`w-full rounded-xl border p-4 text-sm leading-relaxed transition-all focus:outline-none ${
                        !isTopicSubmitted
                          ? `border-stone-200/90 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:bg-white dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:bg-stone-900 ${palette.focusBorder}`
                          : "border-stone-200 bg-stone-50/70 text-stone-900 dark:border-stone-800 dark:bg-stone-950/50 dark:text-stone-200"
                      }`}
                    />

                    {/* Per-Topic Submit / Retry Bar */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-stone-500 dark:text-stone-400">
                        {isTopicSubmitted
                          ? `Topic #${topic.topicNumber} evaluated and saved to localStorage.`
                          : `Submit Topic #${topic.topicNumber} to view similarity score, missing keywords, and word diff.`}
                      </span>
                      {!isTopicSubmitted ? (
                        <button
                          type="button"
                          onClick={() => handleSubmitTopic(topic)}
                          className="rounded-xl border border-[#6e3556] bg-[#6e3556] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-[#542741] dark:border-[#c97da8] dark:bg-[#b56291]"
                        >
                          Submit Topic #{topic.topicNumber}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleResetTopic(topic.id)}
                          className="rounded-xl border border-stone-300/90 bg-stone-100/80 px-3.5 py-1.5 text-xs font-semibold text-stone-700 transition-all hover:border-stone-400 hover:bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                        >
                          Try Topic #{topic.topicNumber} Again
                        </button>
                      )}
                    </div>
                  </div>

                {/* Evaluation Feedback After Submit */}
                {isTopicSubmitted && evalResult && (
                  <div className="mb-6 space-y-4 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-4 text-xs dark:border-neutral-800 dark:bg-neutral-950/70">
                    <div className="grid grid-cols-1 gap-3 border-b border-neutral-200/70 pb-3 sm:grid-cols-3 dark:border-neutral-800">
                      <div className="rounded-xl border border-neutral-200/80 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="text-[11px] font-semibold text-violet-700 dark:text-violet-300">
                          Overall Similarity
                        </div>
                        <div
                          className={`mt-1 text-lg font-bold ${
                            evalResult.similarityPercent >= 75
                              ? "text-green-700 dark:text-green-400"
                              : "text-red-700 dark:text-red-400"
                          }`}
                        >
                          {evalResult.similarityPercent}%
                        </div>
                      </div>
                      <div className="rounded-xl border border-neutral-200/80 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                          Key Vocabulary Recall
                        </div>
                        <div className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                          {evalResult.keywordRecallPercent}% (
                          {evalResult.matchedKeywords.length}/
                          {evalResult.matchedKeywords.length +
                            evalResult.missingKeywords.length}
                          )
                        </div>
                      </div>
                      <div className="rounded-xl border border-neutral-200/80 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                          Word Sequence Overlap
                        </div>
                        <div className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                          {evalResult.sequenceSimilarityPercent}%
                        </div>
                      </div>
                    </div>

                    {/* Matched Key Words */}
                    <div>
                      <div className="mb-1.5 font-medium text-green-700 dark:text-green-400">
                        Matched Key Words ({evalResult.matchedKeywords.length})
                      </div>
                      {evalResult.matchedKeywords.length === 0 ? (
                        <p className="text-neutral-500 dark:text-neutral-400">
                          No key words matched yet.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {evalResult.matchedKeywords.map((kw, kIdx) => (
                            <span
                              key={`${kw}-${kIdx}`}
                              className="rounded-md border border-green-300 bg-green-50 px-2.5 py-0.5 font-medium text-green-900 dark:border-green-700 dark:bg-green-950/60 dark:text-green-200"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Missing Key Words */}
                    <div>
                      <div className="mb-1.5 font-medium text-red-700 dark:text-red-400">
                        Missing Key Words ({evalResult.missingKeywords.length})
                      </div>
                      {evalResult.missingKeywords.length === 0 ? (
                        <p className="font-medium text-green-700 dark:text-green-400">
                          None — you included every key word from the model
                          answer.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {evalResult.missingKeywords.map((kw, kIdx) => (
                            <span
                              key={`${kw}-${kIdx}`}
                              className="rounded-md border border-red-300 bg-red-50 px-2.5 py-0.5 font-medium text-red-900 dark:border-red-700 dark:bg-red-950/60 dark:text-red-200"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Different Wording */}
                    <div>
                      <div className="mb-1.5 font-medium text-neutral-700 dark:text-neutral-300">
                        Different Wording Used (
                        {evalResult.differentWording.length})
                      </div>
                      {evalResult.differentWording.length === 0 ? (
                        <p className="text-neutral-500 dark:text-neutral-400">
                          No extra or different wording detected.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {evalResult.differentWording.map((dw, dIdx) => (
                            <span
                              key={`${dw}-${dIdx}`}
                              className="rounded-md border border-red-300 bg-red-50/50 px-2.5 py-0.5 font-medium text-red-900 dark:border-red-700 dark:bg-red-950/40 dark:text-red-200"
                            >
                              {dw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Word-Level Diff View */}
                    <div>
                      <div className="mb-1.5 font-medium text-neutral-600 dark:text-neutral-400">
                        Word-by-Word Comparison vs. Model Answer
                      </div>
                      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-neutral-200/80 bg-white p-3.5 leading-relaxed dark:border-neutral-800 dark:bg-neutral-900">
                        {evalResult.diffTokens.map((tok, tIdx) => {
                          if (tok.type === "correct") {
                            return (
                              <span
                                key={tIdx}
                                className="rounded-md border border-green-300 bg-green-50 px-1.5 py-0.5 text-green-900 dark:border-green-700 dark:bg-green-950/60 dark:text-green-200"
                              >
                                {tok.text}
                              </span>
                            );
                          }
                          if (tok.type === "wrong") {
                            return (
                              <span
                                key={tIdx}
                                className="rounded-md border border-red-300 bg-red-50 px-1.5 py-0.5 text-red-900 line-through dark:border-red-700 dark:bg-red-950/60 dark:text-red-200"
                              >
                                {tok.text}
                              </span>
                            );
                          }
                          return (
                            <span
                              key={tIdx}
                              className="rounded-md border border-dashed border-red-400 bg-red-50/40 px-1.5 py-0.5 text-[11px] text-red-800 dark:border-red-600 dark:bg-red-950/40 dark:text-red-300"
                            >
                              [{tok.text}]
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Follow-up Questions */}
                <div className="border-t border-neutral-100 pt-4 dark:border-neutral-800/80">
                  <div
                    className={`mb-3 text-xs font-semibold ${palette.modelLabel}`}
                  >
                    Questions about your speech (Topic #{topic.topicNumber})
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                    {topic.followUpQuestions.map((fq, fIdx) => {
                      const noteKey = `${topic.id}-fq-${fIdx}`;
                      const sampleAns = topic.followUpSampleAnswers?.[fIdx];
                      return (
                        <div
                          key={noteKey}
                          className={`rounded-xl border p-3.5 ${palette.fqCard}`}
                        >
                          <p className="mb-2 flex items-start gap-2 text-xs font-medium text-neutral-900 dark:text-neutral-100">
                            <span
                              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${palette.fqNumberPill}`}
                            >
                              {fIdx + 1}
                            </span>
                            <span className="pt-0.5">{fq}</span>
                          </p>
                          {showModelAnswer && sampleAns && (
                            <p className="mb-2 rounded-lg border border-stone-200/80 bg-white/80 px-2.5 py-1.5 text-xs leading-relaxed text-stone-700 dark:border-stone-700/70 dark:bg-stone-900/70 dark:text-stone-300">
                              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                Sample Answer:{" "}
                              </span>
                              {sampleAns}
                            </p>
                          )}
                          <input
                            type="text"
                            disabled={isTopicSubmitted}
                            value={followUpNotes[noteKey] || ""}
                            onChange={(e) =>
                              setFollowUpNotes((prev) => ({
                                ...prev,
                                [noteKey]: e.target.value,
                              }))
                            }
                            placeholder="Optional: draft your answer from the speech..."
                            className={`w-full rounded-lg border border-neutral-200/90 bg-white px-3 py-1.5 text-xs text-neutral-800 placeholder:text-neutral-400 transition-all focus:bg-white focus:outline-none disabled:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:placeholder:text-neutral-500 dark:focus:bg-neutral-900 dark:disabled:bg-neutral-950 ${palette.focusBorder}`}
                          />
                        </div>
                      );
                    })}
                  </div>
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
            {progressSummary.allSubmitted
              ? "All 3 speaking topics evaluated and saved to localStorage."
              : `Submitted ${progressSummary.submittedCount} of ${progressSummary.total} topics. Submit each topic individually above or submit all remaining.`}
          </span>
          <div className="flex items-center gap-3">
            {!progressSummary.allSubmitted && (
              <button
                type="button"
                onClick={handleSubmitAll}
                className="rounded-xl border border-[#6e3556] bg-[#6e3556] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#542741] dark:border-[#c97da8] dark:bg-[#b56291]"
              >
                Submit All Remaining
              </button>
            )}
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-xs font-semibold text-stone-700 transition-all hover:border-[#6e3556] hover:text-[#4f243d] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-[#c97da8] dark:hover:text-[#e6b8d2]"
            >
              Reset & Randomize Section
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
