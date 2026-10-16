"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { HskWord, HSK_WORDS } from "@/data/hskWords";
import {
  UserStudyData,
  getWordProgress,
  updateWordRecall,
  playChineseAudio,
  generateQuiz,
  QuizQuestion,
  shuffleArray,
} from "@/utils/hskUtils";
import { getLevelBadgeClass } from "@/utils/themeColors";

interface StudySectionProps {
  studyData: UserStudyData;
  onUpdateStudyData: (nextData: UserStudyData) => void;
  onSelectWord: (word: HskWord) => void;
  presetWords?: HskWord[] | null;
  onClearPreset?: () => void;
}

type StudyMode = "flashcard" | "quiz";

export function StudySection({
  studyData,
  onUpdateStudyData,
  onSelectWord,
  presetWords,
  onClearPreset,
}: StudySectionProps) {
  const [activeMode, setActiveMode] = useState<StudyMode>("flashcard");

  // Flashcard state
  const [levelScope, setLevelScope] = useState<number | "all">("all");
  const [poolType, setPoolType] = useState<"all" | "unlearned" | "learning" | "starred" | "mistakes">("unlearned");
  const [batchSize, setBatchSize] = useState<number>(20);
  const [direction, setDirection] = useState<"hanzi-to-meaning" | "meaning-to-hanzi">("hanzi-to-meaning");
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(true);

  const [deck, setDeck] = useState<HskWord[]>([]);
  const [deckIndex, setDeckIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);
  const [sessionStats, setSessionStats] = useState<{
    correctWords: HskWord[];
    againWords: HskWord[];
  }>({ correctWords: [], againWords: [] });

  // Quiz state
  const [quizLevel, setQuizLevel] = useState<number | "all">("all");
  const [quizCount, setQuizCount] = useState<number>(10);
  const [quizType, setQuizType] = useState<string>("mix");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizStreak, setQuizStreak] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [quizHistory, setQuizHistory] = useState<{
    question: QuizQuestion;
    userOptionId: string;
    isCorrect: boolean;
  }[]>([]);

  // Start study with preset words if passed
  useEffect(() => {
    if (presetWords && presetWords.length > 0) {
      setDeck(presetWords);
      setDeckIndex(0);
      setIsFlipped(false);
      setSessionActive(true);
      setSessionFinished(false);
      setSessionStats({ correctWords: [], againWords: [] });
      if (onClearPreset) onClearPreset();
    }
  }, [presetWords, onClearPreset]);

  // Current Card
  const currentCard: HskWord | undefined = deck[deckIndex];

  // Auto play audio when card flips
  useEffect(() => {
    if (isFlipped && autoPlayAudio && currentCard) {
      playChineseAudio(currentCard.word);
    }
  }, [isFlipped, autoPlayAudio, currentCard]);

  // Play audio when question changes in quiz
  useEffect(() => {
    if (
      activeMode === "quiz" &&
      quizQuestions.length > 0 &&
      currentQuestionIndex < quizQuestions.length
    ) {
      const q = quizQuestions[currentQuestionIndex];
      if (q.type === "listening-to-hanzi" && q.audioText) {
        playChineseAudio(q.audioText);
      }
    }
  }, [activeMode, quizQuestions, currentQuestionIndex]);

  // Start Flashcard Deck
  const handleStartFlashcards = () => {
    let pool = HSK_WORDS.filter((w) => {
      if (levelScope !== "all" && w.level !== levelScope) return false;
      const prog = getWordProgress(studyData, w.id);
      if (poolType === "unlearned" && prog.status !== "unlearned") return false;
      if (poolType === "learning" && prog.status !== "learning") return false;
      if (poolType === "starred" && !prog.starred) return false;
      if (poolType === "mistakes" && prog.mistakeCount <= 0) return false;
      return true;
    });

    if (pool.length === 0) {
      // Fallback to all words in level if specific pool is empty
      pool = HSK_WORDS.filter((w) => levelScope === "all" || w.level === levelScope);
    }

    const shuffled = shuffleArray(pool).slice(0, batchSize);
    setDeck(shuffled);
    setDeckIndex(0);
    setIsFlipped(false);
    setSessionActive(true);
    setSessionFinished(false);
    setSessionStats({ correctWords: [], againWords: [] });
  };

  // Card feedback action
  const handleCardFeedback = useCallback(
    (outcome: "again" | "hard" | "good") => {
      if (!currentCard) return;

      const nextData = updateWordRecall(studyData, currentCard.id, outcome);
      onUpdateStudyData(nextData);

      if (outcome === "again") {
        setSessionStats((prev) => ({
          ...prev,
          againWords: [...prev.againWords.filter((w) => w.id !== currentCard.id), currentCard],
        }));
        // Re-queue card at end of batch to drill again
        setDeck((prev) => [...prev, currentCard]);
      } else {
        setSessionStats((prev) => ({
          ...prev,
          correctWords: [...prev.correctWords.filter((w) => w.id !== currentCard.id), currentCard],
        }));
      }

      // Next card
      if (deckIndex + 1 < deck.length) {
        setDeckIndex((prev) => prev + 1);
        setIsFlipped(false);
      } else {
        setSessionFinished(true);
      }
    },
    [currentCard, deck.length, deckIndex, onUpdateStudyData, studyData]
  );

  // Keyboard shortcut listener for Flashcards
  useEffect(() => {
    if (!sessionActive || sessionFinished || activeMode !== "flashcard") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (isFlipped) {
        if (e.key === "1" || e.key === "ArrowLeft") {
          e.preventDefault();
          handleCardFeedback("again");
        } else if (e.key === "2" || e.key === "ArrowDown") {
          e.preventDefault();
          handleCardFeedback("hard");
        } else if (e.key === "3" || e.key === "ArrowRight") {
          e.preventDefault();
          handleCardFeedback("good");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sessionActive, sessionFinished, activeMode, isFlipped, handleCardFeedback]);

  // Start Quiz
  const handleStartQuiz = () => {
    let pool = HSK_WORDS.filter((w) => {
      if (quizLevel !== "all" && w.level !== quizLevel) return false;
      return true;
    });

    const specificType =
      quizType === "mix" ? undefined : (quizType as QuizQuestion["type"]);

    const questions = generateQuiz(pool, HSK_WORDS, quizCount, specificType);
    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizStreak(0);
    setQuizFinished(false);
    setQuizHistory([]);
  };

  // Submit Quiz Answer
  const handleSelectQuizOption = (optionId: string) => {
    if (isAnswerSubmitted) return;

    setSelectedOptionId(optionId);
    setIsAnswerSubmitted(true);

    const question = quizQuestions[currentQuestionIndex];
    const selectedOpt = question.options.find((o) => o.id === optionId);
    const isCorrect = !!selectedOpt?.isCorrect;

    // Update study data
    const outcome = isCorrect ? "good" : "again";
    const nextData = updateWordRecall(studyData, question.word.id, outcome);
    onUpdateStudyData(nextData);

    if (isCorrect) {
      setQuizScore((s) => s + 10 + quizStreak * 2);
      setQuizStreak((st) => st + 1);
    } else {
      setQuizStreak(0);
    }

    setQuizHistory((prev) => [
      ...prev,
      { question, userOptionId: optionId, isCorrect },
    ]);
  };

  // Next Question
  const handleNextQuizQuestion = () => {
    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Segmented Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center rounded-xl border border-stone-200 bg-stone-100/70 p-1 dark:border-stone-800 dark:bg-stone-900/60">
          <button
            type="button"
            onClick={() => setActiveMode("flashcard")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeMode === "flashcard"
                ? "bg-white text-[#b84a27] shadow-2xs dark:bg-stone-800 dark:text-[#f39a7d]"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>抽认卡背词 (Flashcards)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode("quiz");
              if (quizQuestions.length === 0) handleStartQuiz();
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeMode === "quiz"
                ? "bg-white text-[#b84a27] shadow-2xs dark:bg-stone-800 dark:text-[#f39a7d]"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span>背词检测闯关 (Quiz Mode)</span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          MODE 1: FLASHCARDS
          ==================================================================== */}
      {activeMode === "flashcard" && (
        <div>
          {!sessionActive || sessionFinished ? (
            /* Setup or Finished Screen */
            <div className="studio-card mx-auto max-w-2xl rounded-2xl border p-6 shadow-xs sm:p-8">
              {sessionFinished ? (
                /* Session Finished Summary */
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="mt-4 font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                    Hoàn thành đợt học! 🎉
                  </h3>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                    Bạn vừa ôn tập {sessionStats.correctWords.length + sessionStats.againWords.length} từ vựng
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                      <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                        {sessionStats.correctWords.length}
                      </div>
                      <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        Đã ghi nhớ tốt
                      </div>
                    </div>
                    <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 dark:border-red-900/60 dark:bg-red-950/30">
                      <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                        {sessionStats.againWords.length}
                      </div>
                      <div className="text-xs font-semibold text-red-800 dark:text-red-300">
                        Cần củng cố thêm
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    {sessionStats.againWords.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setDeck(sessionStats.againWords);
                          setDeckIndex(0);
                          setIsFlipped(false);
                          setSessionFinished(false);
                          setSessionStats({ correctWords: [], againWords: [] });
                        }}
                        className="rounded-xl border border-red-300 bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700"
                      >
                        Luyện lại các từ chưa thuộc ({sessionStats.againWords.length} từ)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleStartFlashcards}
                      className="rounded-xl border border-[#b84a27] bg-[#b84a27] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#9e3c1e] dark:border-[#e06d48] dark:bg-[#d46543] dark:hover:bg-[#e06d48]"
                    >
                      Bắt đầu đợt học mới ({batchSize} từ)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode("quiz");
                        handleStartQuiz();
                      }}
                      className="rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                    >
                      Làm bài kiểm tra trắc nghiệm
                    </button>
                  </div>
                </div>
              ) : (
                /* Flashcard Setup Config Screen */
                <div>
                  <div className="text-center">
                    <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                      Thiết lập học 抽认卡 (Flashcards)
                    </h3>
                    <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                      Chọn cấp độ, nhóm từ và số lượng từ vựng cho mỗi lượt học
                    </p>
                  </div>

                  <div className="mt-6 space-y-5">
                    {/* Level Scope */}
                    <div>
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        1. Chọn cấp độ HSK 3.0:
                      </label>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {[
                          { id: "all", label: "Toàn bộ" },
                          { id: 1, label: "HSK 1 (300)" },
                          { id: 2, label: "HSK 2 (200)" },
                          { id: 3, label: "HSK 3 (500)" },
                        ].map((lvl) => (
                          <button
                            key={String(lvl.id)}
                            type="button"
                            onClick={() => setLevelScope(lvl.id as any)}
                            className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                              levelScope === lvl.id
                                ? "border-[#b84a27] bg-[#b84a27] text-white dark:border-[#e06d48] dark:bg-[#d46543]"
                                : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
                            }`}
                          >
                            {lvl.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Word Pool Selection */}
                    <div>
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        2. Nhóm từ muốn học:
                      </label>
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[
                          { id: "unlearned", label: "⭕ Từ chưa học" },
                          { id: "learning", label: "📖 Từ đang học" },
                          { id: "starred", label: "⭐️ Từ đã lưu" },
                          { id: "mistakes", label: "❌ Sổ tay từ sai" },
                        ].map((pool) => (
                          <button
                            key={pool.id}
                            type="button"
                            onClick={() => setPoolType(pool.id as any)}
                            className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                              poolType === pool.id
                                ? "border-[#b84a27] bg-[#faece6] text-[#b84a27] dark:border-[#e06d48] dark:bg-[#331911] dark:text-[#f39a7d]"
                                : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
                            }`}
                          >
                            {pool.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Batch Size & Direction */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                          3. Số lượng từ mỗi lượt:
                        </label>
                        <div className="mt-2 flex items-center gap-2">
                          {[10, 20, 30, 50].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setBatchSize(num)}
                              className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-all ${
                                batchSize === num
                                  ? "border-[#b84a27] bg-[#b84a27] text-white dark:border-[#e06d48] dark:bg-[#d46543]"
                                  : "border-stone-200 bg-white text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
                              }`}
                            >
                              {num} từ
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                          4. Chiều nhớ từ:
                        </label>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDirection("hanzi-to-meaning")}
                            className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-all ${
                              direction === "hanzi-to-meaning"
                                ? "border-[#b84a27] bg-[#faece6] text-[#b84a27] dark:border-[#e06d48] dark:bg-[#331911] dark:text-[#f39a7d]"
                                : "border-stone-200 bg-white text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
                            }`}
                          >
                            Chữ Hán → Nghĩa
                          </button>
                          <button
                            type="button"
                            onClick={() => setDirection("meaning-to-hanzi")}
                            className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-all ${
                              direction === "meaning-to-hanzi"
                                ? "border-[#b84a27] bg-[#faece6] text-[#b84a27] dark:border-[#e06d48] dark:bg-[#331911] dark:text-[#f39a7d]"
                                : "border-stone-200 bg-white text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
                            }`}
                          >
                            Nghĩa → Chữ Hán
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Auto-audio option */}
                    <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/60">
                      <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                        🔊 Tự động phát âm khi lật thẻ
                      </span>
                      <button
                        type="button"
                        onClick={() => setAutoPlayAudio(!autoPlayAudio)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          autoPlayAudio ? "bg-[#b84a27] dark:bg-[#e06d48]" : "bg-stone-300 dark:bg-stone-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            autoPlayAudio ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Start Button */}
                    <button
                      type="button"
                      onClick={handleStartFlashcards}
                      className="w-full rounded-xl border border-[#b84a27] bg-[#b84a27] py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#9e3c1e] hover:shadow-lg dark:border-[#e06d48] dark:bg-[#d46543] dark:hover:bg-[#e06d48]"
                    >
                      Bắt đầu học ngay →
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Active Flashcard Screen */
            currentCard && (
              <div className="mx-auto max-w-xl space-y-4">
                {/* Progress Bar & Header */}
                <div className="flex items-center justify-between text-xs font-semibold text-stone-600 dark:text-stone-400">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-stone-200 bg-white px-2 py-0.5 text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                      Thẻ {deckIndex + 1} / {deck.length}
                    </span>
                    <span
                      className={`rounded-md border px-2 py-0.5 ${getLevelBadgeClass(
                        currentCard.level
                      )}`}
                    >
                      HSK {currentCard.level}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSessionActive(false)}
                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  >
                    Kết thúc đợt học ✕
                  </button>
                </div>

                {/* Progress line */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                  <div
                    className="h-full bg-[#b84a27] transition-all duration-300 dark:bg-[#e06d48]"
                    style={{ width: `${((deckIndex + 1) / deck.length) * 100}%` }}
                  />
                </div>

                {/* 3D Flashcard */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="studio-card group relative min-h-[320px] cursor-pointer rounded-3xl border border-[#ded3c3] p-8 text-center shadow-lg transition-all duration-300 hover:border-[#b84a27]/60 sm:min-h-[360px] dark:border-stone-800 dark:hover:border-[#e06d48]/60"
                >
                  {/* Subtle top indicator */}
                  <div className="flex items-center justify-between text-2xs text-stone-400">
                    <span>{isFlipped ? "Mặt sau (Chi tiết)" : "Mặt trước (Nhấn để lật)"}</span>
                    <span className="font-mono">Phím tắt: Space để lật</span>
                  </div>

                  {/* Card Content */}
                  {!isFlipped ? (
                    /* Front Side */
                    <div className="flex flex-col items-center justify-center py-10">
                      {direction === "hanzi-to-meaning" ? (
                        <>
                          <div className="font-serif text-6xl font-bold tracking-tight text-stone-900 transition-transform group-hover:scale-105 dark:text-stone-100 sm:text-7xl">
                            {currentCard.word}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playChineseAudio(currentCard.word);
                            }}
                            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-700 hover:border-[#b84a27] hover:text-[#b84a27] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            <span>Nghe phát âm</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="text-2xs font-bold tracking-wider text-stone-400 uppercase">
                            Nghĩa tiếng Việt
                          </div>
                          <div className="mt-2 text-3xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl">
                            {currentCard.meaningVi}
                          </div>
                          <div className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                            [{currentCard.pos}]
                          </div>
                        </>
                      )}

                      <div className="mt-8 text-xs font-medium text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300">
                        Nhấn vào thẻ hoặc nhấn Space để xem đáp án ↺
                      </div>
                    </div>
                  ) : (
                    /* Back Side */
                    <div className="flex flex-col items-center justify-center py-4 animate-in fade-in zoom-in-95 duration-200">
                      <div className="font-mono text-xl font-bold text-[#b84a27] dark:text-[#f39a7d]">
                        {currentCard.pinyin}
                      </div>

                      <div className="mt-1 font-serif text-5xl font-bold text-stone-900 dark:text-stone-100">
                        {currentCard.word}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                        <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-0.5 text-xs font-semibold text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                          Âm Hán-Việt: {currentCard.hanviet}
                        </span>
                        <span className="rounded-full border border-stone-200 bg-stone-100 px-3 py-0.5 text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
                          {currentCard.pos}
                        </span>
                      </div>

                      <div className="mt-4 rounded-xl border border-stone-200/80 bg-stone-50/80 p-3 text-center dark:border-stone-800 dark:bg-stone-900/70">
                        <div className="text-base font-bold text-stone-900 dark:text-stone-100">
                          {currentCard.meaningVi}
                        </div>
                        {currentCard.meaningEn && (
                          <div className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                            {currentCard.meaningEn}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playChineseAudio(currentCard.word);
                        }}
                        className="mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-[#b84a27] hover:bg-[#faece6] dark:text-[#f39a7d] dark:hover:bg-[#331911]"
                      >
                        🔊 Phát âm lại
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Feedback Controls */}
                {isFlipped ? (
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleCardFeedback("again")}
                      className="group flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/80 py-3 text-red-700 transition-all hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70"
                    >
                      <span className="text-sm font-bold">Chưa thuộc</span>
                      <span className="text-2xs opacity-75">Phím 1 / ←</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCardFeedback("hard")}
                      className="group flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50/80 py-3 text-amber-700 transition-all hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/70"
                    >
                      <span className="text-sm font-bold">Hơi mơ hồ</span>
                      <span className="text-2xs opacity-75">Phím 2 / ↓</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCardFeedback("good")}
                      className="group flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/80 py-3 text-emerald-700 transition-all hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70"
                    >
                      <span className="text-sm font-bold">Đã nhớ tốt</span>
                      <span className="text-2xs opacity-75">Phím 3 / →</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="w-full rounded-2xl border border-stone-200 bg-white py-3 text-xs font-bold text-stone-800 shadow-2xs hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
                  >
                    Lật thẻ để kiểm tra đáp án (Space)
                  </button>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* ====================================================================
          MODE 2: QUIZ CHALLENGE
          ==================================================================== */}
      {activeMode === "quiz" && (
        <div className="mx-auto max-w-2xl">
          {quizQuestions.length === 0 || quizFinished ? (
            /* Quiz Setup or Result */
            <div className="studio-card rounded-2xl border p-6 shadow-xs sm:p-8">
              {quizFinished ? (
                /* Quiz Finished Result */
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <h3 className="mt-4 font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                    Hoàn thành bài kiểm tra!
                  </h3>
                  <div className="mt-2 text-3xl font-extrabold text-[#b84a27] dark:text-[#f39a7d]">
                    {quizScore} Điểm
                  </div>
                  <p className="mt-1 text-xs text-stone-500">
                    Đúng {quizHistory.filter((h) => h.isCorrect).length} / {quizQuestions.length} câu
                  </p>

                  {/* Question breakdown list */}
                  <div className="mt-6 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-left dark:border-stone-800 dark:bg-stone-900/50">
                    {quizHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between rounded-lg border p-2 text-xs ${
                          item.isCorrect
                            ? "border-emerald-200 bg-emerald-50/60 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                            : "border-red-200 bg-red-50/60 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{item.isCorrect ? "✓" : "✗"}</span>
                          <span className="font-serif font-bold text-sm">{item.question.word.word}</span>
                          <span className="font-mono text-2xs">{item.question.word.pinyin}</span>
                          <span className="text-2xs opacity-80">— {item.question.word.meaningVi}</span>
                        </div>
                        <span className="text-2xs opacity-75">{item.question.word.hanviet}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleStartQuiz}
                      className="rounded-xl border border-[#b84a27] bg-[#b84a27] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#9e3c1e] dark:border-[#e06d48] dark:bg-[#d46543] dark:hover:bg-[#e06d48]"
                    >
                      Làm lượt trắc nghiệm mới
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMode("flashcard")}
                      className="rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                    >
                      Quay lại học Flashcard
                    </button>
                  </div>
                </div>
              ) : (
                /* Quiz Setup Screen */
                <div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                    Cấu hình Trắc nghiệm Từ vựng
                  </h3>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    Kiểm tra phản xạ ghi nhớ chữ Hán, Pinyin, và nghĩa tiếng Việt
                  </p>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        Cấp độ kiểm tra:
                      </label>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {[
                          { id: "all", label: "Toàn bộ" },
                          { id: 1, label: "HSK 1" },
                          { id: 2, label: "HSK 2" },
                          { id: 3, label: "HSK 3" },
                        ].map((lvl) => (
                          <button
                            key={String(lvl.id)}
                            type="button"
                            onClick={() => setQuizLevel(lvl.id as any)}
                            className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                              quizLevel === lvl.id
                                ? "border-[#b84a27] bg-[#b84a27] text-white dark:border-[#e06d48] dark:bg-[#d46543]"
                                : "border-stone-200 bg-white text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
                            }`}
                          >
                            {lvl.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        Dạng câu hỏi:
                      </label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {[
                          { id: "mix", label: "🎲 Kết hợp ngẫu nhiên các dạng" },
                          { id: "hanzi-to-meaning", label: "📖 Nhìn chữ Hán chọn nghĩa" },
                          { id: "meaning-to-hanzi", label: "🔍 Nhìn nghĩa chọn chữ Hán" },
                          { id: "hanzi-to-pinyin", label: "🔤 Nhìn chữ Hán chọn Pinyin" },
                          { id: "listening-to-hanzi", label: "🔊 Nghe phát âm chọn chữ Hán" },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setQuizType(t.id)}
                            className={`rounded-xl border p-2.5 text-left text-xs font-semibold transition-all ${
                              quizType === t.id
                                ? "border-[#b84a27] bg-[#faece6] text-[#b84a27] dark:border-[#e06d48] dark:bg-[#331911] dark:text-[#f39a7d]"
                                : "border-stone-200 bg-white text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        Số lượng câu hỏi:
                      </label>
                      <div className="mt-2 flex items-center gap-2">
                        {[10, 15, 20, 30].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setQuizCount(num)}
                            className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-all ${
                              quizCount === num
                                ? "border-[#b84a27] bg-[#b84a27] text-white dark:border-[#e06d48] dark:bg-[#d46543]"
                                : "border-stone-200 bg-white text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
                            }`}
                          >
                            {num} câu
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartQuiz}
                      className="mt-4 w-full rounded-xl border border-[#b84a27] bg-[#b84a27] py-3 text-sm font-bold text-white shadow-md hover:bg-[#9e3c1e] dark:border-[#e06d48] dark:bg-[#d46543] dark:hover:bg-[#e06d48]"
                    >
                      Bắt đầu kiểm tra ngay →
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Active Quiz Question Screen */
            (() => {
              const question = quizQuestions[currentQuestionIndex];
              if (!question) return null;

              return (
                <div className="studio-card rounded-2xl border p-6 shadow-md sm:p-8">
                  {/* Top Bar: Progress & Streak */}
                  <div className="flex items-center justify-between border-b border-stone-200/80 pb-4 dark:border-stone-800">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-bold text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                        Câu {currentQuestionIndex + 1} / {quizQuestions.length}
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${getLevelBadgeClass(
                          question.word.level
                        )}`}
                      >
                        HSK {question.word.level}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {quizStreak > 1 && (
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-600 dark:text-amber-400">
                          🔥 Combo x{quizStreak}
                        </span>
                      )}
                      <span className="text-sm font-bold text-[#b84a27] dark:text-[#f39a7d]">
                        {quizScore} đ
                      </span>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div className="py-6 text-center">
                    <div className="text-2xs font-bold tracking-wider text-stone-400 uppercase">
                      {question.type === "hanzi-to-meaning" && "Chọn nghĩa tiếng Việt của chữ Hán:"}
                      {question.type === "meaning-to-hanzi" && "Chọn chữ Hán có nghĩa tương ứng:"}
                      {question.type === "hanzi-to-pinyin" && "Chọn Pinyin chính xác của chữ Hán:"}
                      {question.type === "listening-to-hanzi" && "Lắng nghe và chọn chữ Hán đúng:"}
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-3">
                      <h2 className="font-serif text-4xl font-bold text-stone-900 dark:text-stone-100 sm:text-5xl">
                        {question.prompt}
                      </h2>
                      {question.audioText && (
                        <button
                          type="button"
                          onClick={() => playChineseAudio(question.audioText!)}
                          className="rounded-full border border-stone-200 bg-white p-2 text-stone-700 shadow-2xs hover:border-[#b84a27] hover:text-[#b84a27] dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {question.subPrompt && (
                      <p className="mt-2 text-xs font-medium text-stone-500 dark:text-stone-400">
                        {question.subPrompt}
                      </p>
                    )}
                  </div>

                  {/* 4 Multiple Choice Options */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {question.options.map((option) => {
                      const isSelected = selectedOptionId === option.id;
                      let btnStyle =
                        "border-stone-200 bg-white text-stone-800 hover:border-[#b84a27] hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200";

                      if (isAnswerSubmitted) {
                        if (option.isCorrect) {
                          btnStyle =
                            "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-200 ring-2 ring-emerald-500/30";
                        } else if (isSelected && !option.isCorrect) {
                          btnStyle =
                            "border-red-500 bg-red-50 text-red-900 font-bold dark:border-red-600 dark:bg-red-950/60 dark:text-red-200";
                        } else {
                          btnStyle = "border-stone-200 opacity-40 dark:border-stone-800";
                        }
                      }

                      return (
                        <button
                          key={option.id}
                          type="button"
                          disabled={isAnswerSubmitted}
                          onClick={() => handleSelectQuizOption(option.id)}
                          className={`rounded-xl border p-4 text-left transition-all ${btnStyle}`}
                        >
                          <div className="text-base font-bold">{option.text}</div>
                          {option.subText && (
                            <div className="mt-1 text-2xs opacity-75">{option.subText}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation & Next Button */}
                  {isAnswerSubmitted && (
                    <div className="mt-6 border-t border-stone-200/80 pt-4 animate-in fade-in duration-200 dark:border-stone-800">
                      <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 text-xs text-stone-700 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300">
                        <span className="font-bold text-[#b84a27] dark:text-[#f39a7d]">
                          Giải thích chi tiết:{" "}
                        </span>
                        {question.explanation}
                      </div>

                      <div className="mt-4 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={handleNextQuizQuestion}
                          className="rounded-xl border border-[#b84a27] bg-[#b84a27] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#9e3c1e] dark:border-[#e06d48] dark:bg-[#d46543] dark:hover:bg-[#e06d48]"
                        >
                          {currentQuestionIndex + 1 < quizQuestions.length
                            ? "Câu tiếp theo →"
                            : "Xem kết quả bài kiểm tra 🏆"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
}

