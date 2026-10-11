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
  const [submitted, setSubmitted] = useState(false);
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
    if (!submitted) return {};
    const map: Record<string, SpeakingComparisonResult> = {};
    randomizedTopics.forEach((topic) => {
      map[topic.id] = evaluateSpeakingAttempt(
        userDrafts[topic.id] || "",
        topic.modelAnswer
      );
    });
    return map;
  }, [submitted, randomizedTopics, userDrafts]);

  const averageSimilarity = useMemo(() => {
    if (!submitted || !randomizedTopics.length) return 0;
    const sum = randomizedTopics.reduce(
      (acc, t) => acc + (evaluations[t.id]?.similarityPercent ?? 0),
      0
    );
    return Math.round(sum / randomizedTopics.length);
  }, [submitted, randomizedTopics, evaluations]);

  const handleSubmit = () => {
    setSubmitted(true);

    const newRecords: SpeakingAttemptRecord[] = [];
    const nowStr = new Date().toLocaleString();

    randomizedTopics.forEach((topic) => {
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

  const handleRetry = () => {
    setSubmitted(false);
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
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-4 md:flex-row md:items-center dark:border-neutral-800/80">
          <div>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Section 2 • Topics 33, 35, 36
            </span>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              2. Speaking — Sample Topics
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Study the model answers and follow-up questions, or switch to
              Practice Mode to type from memory and evaluate keyword recall.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMode("study");
              }}
              className={`rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeMode === "study"
                  ? "border-neutral-900 bg-neutral-900 text-white shadow-2xs dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                  : "border-neutral-200/90 bg-neutral-50/70 text-neutral-700 hover:border-neutral-300 hover:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
              }`}
            >
              Study Mode (Model Shown)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("practice");
              }}
              className={`rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeMode === "practice"
                  ? "border-neutral-900 bg-neutral-900 text-white shadow-2xs dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                  : "border-neutral-200/90 bg-neutral-50/70 text-neutral-700 hover:border-neutral-300 hover:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
              }`}
            >
              Practice Mode (Model Hidden)
            </button>
            <button
              type="button"
              onClick={() => setMode("flashcard")}
              className={`rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeMode === "flashcard"
                  ? "border-neutral-900 bg-neutral-900 text-white shadow-2xs dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                  : "border-neutral-200/90 bg-neutral-50/70 text-neutral-700 hover:border-neutral-300 hover:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
              }`}
            >
              Flashcards
            </button>
            <button
              type="button"
              onClick={() => setShowHistory((h) => !h)}
              className={`rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-all ${
                showHistory
                  ? "border-neutral-400 bg-neutral-200/80 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                  : "border-neutral-200/90 bg-neutral-50/70 text-neutral-700 hover:border-neutral-300 hover:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
              }`}
            >
              Saved Attempts ({savedAttempts.length})
            </button>
          </div>
        </div>

        {submitted && activeMode !== "flashcard" && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200/90 bg-neutral-50/80 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="text-sm">
              <span className="font-medium text-neutral-600 dark:text-neutral-400">
                Average Similarity Score:{" "}
              </span>
              <span
                className={`font-semibold ${
                  averageSimilarity >= 80
                    ? "text-green-700 dark:text-green-400"
                    : "text-neutral-900 dark:text-neutral-100"
                }`}
              >
                {averageSimilarity}%
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

      {/* Saved Attempts Drawer */}
      {showHistory && (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
          <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3.5 dark:border-neutral-800">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Saved Speaking Attempts (localStorage)
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Past practice submissions stored locally in your browser for
                review.
              </p>
            </div>
            {savedAttempts.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="rounded-lg border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 transition-all hover:border-red-400 hover:text-red-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-red-500 dark:hover:text-red-400"
              >
                Clear Saved History
              </button>
            )}
          </div>

          {savedAttempts.length === 0 ? (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              No speaking attempts saved yet. Type an answer in Practice Mode
              and click Submit to record your attempt.
            </p>
          ) : (
            <div className="space-y-3">
              {savedAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-4 text-xs dark:border-neutral-800 dark:bg-neutral-950/70"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/70 pb-2 dark:border-neutral-800">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {attempt.topicTitle}
                    </span>
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          attempt.similarityPercent >= 75
                            ? "font-semibold text-green-700 dark:text-green-400"
                            : "font-semibold text-red-700 dark:text-red-400"
                        }
                      >
                        Similarity: {attempt.similarityPercent}%
                      </span>
                      <span className="text-neutral-500 dark:text-neutral-400">
                        {attempt.timestamp}
                      </span>
                    </div>
                  </div>
                  <p className="mb-2 text-sm text-neutral-800 dark:text-neutral-200">
                    {attempt.userAnswer}
                  </p>
                  {attempt.missingKeywords.length > 0 && (
                    <div className="mt-1">
                      <span className="font-semibold text-red-700 dark:text-red-400">
                        Missing Key Words:{" "}
                      </span>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {attempt.missingKeywords.join(", ")}
                      </span>
                    </div>
                  )}
                  {attempt.differentWording.length > 0 && (
                    <div className="mt-1">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Different Wording:{" "}
                      </span>
                      <span className="text-neutral-700 dark:text-neutral-300">
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
            const evalResult = evaluations[topic.id];
            const showModelAnswer = activeMode === "study" || submitted;

            return (
              <div
                key={topic.id}
                className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3.5 dark:border-neutral-800/80">
                  <div>
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Topic {idx + 1} of {randomizedTopics.length}
                    </span>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {topic.title}
                    </h3>
                  </div>

                  {submitted && evalResult && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          evalResult.similarityPercent >= 75
                            ? "border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950/60 dark:text-green-300"
                            : "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/60 dark:text-red-300"
                        }`}
                      >
                        Similarity: {evalResult.similarityPercent}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Model Answer Box */}
                {showModelAnswer ? (
                  <div className="mb-5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/70">
                    <div className="mb-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Model Answer
                    </div>
                    <p className="text-sm leading-relaxed text-neutral-900 dark:text-neutral-100">
                      {topic.modelAnswer
                        .split(topic.highlightedTerm)
                        .map((part, pIdx, arr) => (
                          <React.Fragment key={pIdx}>
                            {part}
                            {pIdx < arr.length - 1 && (
                              <strong className="rounded-md border border-green-300 bg-green-50 px-1.5 py-0.5 font-semibold text-green-900 dark:border-green-700 dark:bg-green-950/60 dark:text-green-200">
                                {topic.highlightedTerm}
                              </strong>
                            )}
                          </React.Fragment>
                        ))}
                    </p>
                  </div>
                ) : (
                  <div className="mb-5 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 px-4 py-3 text-xs text-neutral-600 dark:border-neutral-700 dark:bg-neutral-950/60 dark:text-neutral-400">
                    Model answer is hidden in Practice Mode. Type your response
                    from memory below and submit to compare.
                  </div>
                )}

                {/* Memory Recall Textarea */}
                <div className="mb-5">
                  <label className="mb-2 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Your Speaking Response (Type from memory)
                  </label>
                  <textarea
                    rows={5}
                    disabled={submitted}
                    value={userDrafts[topic.id] || ""}
                    onChange={(e) =>
                      setUserDrafts((prev) => ({
                        ...prev,
                        [topic.id]: e.target.value,
                      }))
                    }
                    placeholder={`Write the speech for "${topic.title}" from memory...`}
                    className={`w-full rounded-xl border p-4 text-sm leading-relaxed transition-all focus:outline-none ${
                      !submitted
                        ? "border-neutral-200/90 bg-neutral-50/50 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:bg-neutral-900"
                        : "border-neutral-200 bg-neutral-50/70 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-200"
                    }`}
                  />
                </div>

                {/* Evaluation Feedback After Submit */}
                {submitted && evalResult && (
                  <div className="mb-6 space-y-4 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-4 text-xs dark:border-neutral-800 dark:bg-neutral-950/70">
                    <div className="grid grid-cols-1 gap-3 border-b border-neutral-200/70 pb-3 sm:grid-cols-3 dark:border-neutral-800">
                      <div className="rounded-xl border border-neutral-200/80 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
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
                        <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
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
                        <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
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
                  <div className="mb-3 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Possible follow-up questions (Topic {topic.topicNumber})
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                    {topic.followUpQuestions.map((fq, fIdx) => {
                      const noteKey = `${topic.id}-fq-${fIdx}`;
                      return (
                        <div
                          key={noteKey}
                          className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3.5 dark:border-neutral-800 dark:bg-neutral-950/60"
                        >
                          <p className="mb-2 text-xs font-medium text-neutral-900 dark:text-neutral-100">
                            {fIdx + 1}. {fq}
                          </p>
                          <input
                            type="text"
                            disabled={submitted}
                            value={followUpNotes[noteKey] || ""}
                            onChange={(e) =>
                              setFollowUpNotes((prev) => ({
                                ...prev,
                                [noteKey]: e.target.value,
                              }))
                            }
                            placeholder="Optional: draft your follow-up answer..."
                            className="w-full rounded-lg border border-neutral-200/90 bg-white px-3 py-1.5 text-xs text-neutral-800 placeholder:text-neutral-400 transition-all focus:border-neutral-400 focus:bg-white focus:outline-none disabled:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:bg-neutral-900 dark:disabled:bg-neutral-950"
                          />
                        </div>
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
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-white px-6 py-4 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {submitted
              ? "Speaking evaluation complete and saved to localStorage."
              : "Submit to compare your response with the model answer and save to localStorage."}
          </span>
          <div className="flex items-center gap-3">
            {submitted ? (
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-xl border border-neutral-900 bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition-all hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Retry Speaking Section
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-xl border border-neutral-900 bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition-all hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Submit Speaking Section
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
