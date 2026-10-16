"use client";

import React, { useState, useMemo } from "react";
import { HskWord, HSK_WORDS } from "@/data/hskWords";
import {
  UserStudyData,
  getWordProgress,
  isWordDueForReview,
  playChineseAudio,
  clearMistakeRecord,
  toggleWordStar,
} from "@/utils/hskUtils";
import { getLevelBadgeClass, getStatusBadgeClass } from "@/utils/themeColors";

interface ReviewSectionProps {
  studyData: UserStudyData;
  onUpdateStudyData: (nextData: UserStudyData) => void;
  onSelectWord: (word: HskWord) => void;
  onStartReviewSession: (words: HskWord[]) => void;
}

type ReviewTab = "due" | "mistakes" | "starred" | "mastered";

export function ReviewSection({
  studyData,
  onUpdateStudyData,
  onSelectWord,
  onStartReviewSession,
}: ReviewSectionProps) {
  const [activeTab, setActiveTab] = useState<ReviewTab>("due");
  const [playingWordId, setPlayingWordId] = useState<number | null>(null);

  // 1. Words due for SRS review today
  const dueWords = useMemo(() => {
    return HSK_WORDS.filter((w) => {
      const prog = getWordProgress(studyData, w.id);
      return isWordDueForReview(prog);
    });
  }, [studyData]);

  // 2. Mistake words
  const mistakeWords = useMemo(() => {
    return HSK_WORDS.filter((w) => {
      const prog = getWordProgress(studyData, w.id);
      return prog.mistakeCount > 0;
    }).sort((a, b) => {
      const pa = getWordProgress(studyData, a.id);
      const pb = getWordProgress(studyData, b.id);
      return pb.mistakeCount - pa.mistakeCount;
    });
  }, [studyData]);

  // 3. Starred words
  const starredWords = useMemo(() => {
    return HSK_WORDS.filter((w) => {
      const prog = getWordProgress(studyData, w.id);
      return prog.starred;
    });
  }, [studyData]);

  // 4. Mastered words
  const masteredWords = useMemo(() => {
    return HSK_WORDS.filter((w) => {
      const prog = getWordProgress(studyData, w.id);
      return prog.status === "mastered";
    });
  }, [studyData]);

  const handlePlayAudio = async (e: React.MouseEvent, word: HskWord) => {
    e.stopPropagation();
    setPlayingWordId(word.id);
    await playChineseAudio(word.word);
    setPlayingWordId(null);
  };

  const handleClearMistake = (e: React.MouseEvent, wordId: number) => {
    e.stopPropagation();
    const next = clearMistakeRecord(studyData, wordId);
    onUpdateStudyData(next);
  };

  const handleToggleStar = (e: React.MouseEvent, wordId: number) => {
    e.stopPropagation();
    const next = toggleWordStar(studyData, wordId);
    onUpdateStudyData(next);
  };

  return (
    <div className="space-y-6">
      {/* Review Dashboard Top Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Due Today Card */}
        <button
          type="button"
          onClick={() => setActiveTab("due")}
          className={`studio-card rounded-2xl border p-4 text-left transition-all ${
            activeTab === "due"
              ? "border-[#b84a27] ring-2 ring-[#b84a27]/20 dark:border-[#e06d48]"
              : "hover:border-stone-300 dark:hover:border-stone-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-stone-500 uppercase dark:text-stone-400">
              Hôm nay cần ôn
            </span>
            <span className="text-base">⏳</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#b84a27] dark:text-[#f39a7d]">
            {dueWords.length}
          </div>
          <div className="mt-1 text-2xs text-stone-500 dark:text-stone-400">
            Từ đến hạn Spaced Repetition
          </div>
        </button>

        {/* Mistakes Card */}
        <button
          type="button"
          onClick={() => setActiveTab("mistakes")}
          className={`studio-card rounded-2xl border p-4 text-left transition-all ${
            activeTab === "mistakes"
              ? "border-red-500 ring-2 ring-red-500/20 dark:border-red-600"
              : "hover:border-stone-300 dark:hover:border-stone-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-stone-500 uppercase dark:text-stone-400">
              Sổ tay từ khó
            </span>
            <span className="text-base">❌</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-red-600 dark:text-red-400">
            {mistakeWords.length}
          </div>
          <div className="mt-1 text-2xs text-stone-500 dark:text-stone-400">
            Các từ từng trả lời sai
          </div>
        </button>

        {/* Starred Card */}
        <button
          type="button"
          onClick={() => setActiveTab("starred")}
          className={`studio-card rounded-2xl border p-4 text-left transition-all ${
            activeTab === "starred"
              ? "border-amber-500 ring-2 ring-amber-500/20 dark:border-amber-600"
              : "hover:border-stone-300 dark:hover:border-stone-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-stone-500 uppercase dark:text-stone-400">
              Từ vựng đã lưu
            </span>
            <span className="text-base">⭐️</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {starredWords.length}
          </div>
          <div className="mt-1 text-2xs text-stone-500 dark:text-stone-400">
            Từ đánh dấu sao quan trọng
          </div>
        </button>

        {/* Mastered Card */}
        <button
          type="button"
          onClick={() => setActiveTab("mastered")}
          className={`studio-card rounded-2xl border p-4 text-left transition-all ${
            activeTab === "mastered"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 dark:border-emerald-600"
              : "hover:border-stone-300 dark:hover:border-stone-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-stone-500 uppercase dark:text-stone-400">
              Đã ghi nhớ sâu
            </span>
            <span className="text-base">✅</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {masteredWords.length}
          </div>
          <div className="mt-1 text-2xs text-stone-500 dark:text-stone-400">
            Đạt cấp độ bền vững
          </div>
        </button>
      </div>

      {/* Tab Specific Content */}
      <div className="space-y-4">
        {/* Tab 1: Due Words */}
        {activeTab === "due" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                  Lộ trình ôn tập ngắt quãng hôm nay (Spaced Repetition)
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Hệ thống tự động tính toán thời điểm vàng trước khi đường cong quên lãng giảm sút
                </p>
              </div>

              {dueWords.length > 0 && (
                <button
                  type="button"
                  onClick={() => onStartReviewSession(dueWords)}
                  className="rounded-xl border border-[#b84a27] bg-[#b84a27] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#9e3c1e] dark:border-[#e06d48] dark:bg-[#d46543] dark:hover:bg-[#e06d48]"
                >
                  Bắt đầu ôn tập ngay ({dueWords.length} từ) →
                </button>
              )}
            </div>

            {dueWords.length === 0 ? (
              <div className="studio-card rounded-2xl border p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="mt-4 text-base font-bold text-stone-900 dark:text-stone-100">
                  Tuyệt vời! Không có từ nào cần ôn tập hôm nay 🎉
                </h4>
                <p className="mx-auto mt-1 max-w-md text-xs text-stone-500 dark:text-stone-400">
                  Bạn đã hoàn thành các từ đến hạn. Bạn có thể sang mục &ldquo;Sổ tay từ khó&rdquo; để xóa sổ các từ từng sai, hoặc vào mục &ldquo;Tra từ&rdquo; để học thêm từ mới!
                </p>
                {mistakeWords.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("mistakes")}
                    className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                  >
                    Xem sổ tay từ khó ({mistakeWords.length} từ)
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {dueWords.map((word) => (
                  <ReviewWordCard
                    key={word.id}
                    word={word}
                    studyData={studyData}
                    isPlaying={playingWordId === word.id}
                    onPlayAudio={(e) => handlePlayAudio(e, word)}
                    onSelect={() => onSelectWord(word)}
                    onToggleStar={(e) => handleToggleStar(e, word.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Mistakes Notebook */}
        {activeTab === "mistakes" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                  Sổ tay từ khó & Từ từng làm sai (错题本)
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Luyện tập nhiều lần các từ này để biến điểm yếu thành điểm mạnh
                </p>
              </div>

              {mistakeWords.length > 0 && (
                <button
                  type="button"
                  onClick={() => onStartReviewSession(mistakeWords)}
                  className="rounded-xl border border-red-500 bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700"
                >
                  Luyện lại tất cả các từ sai ({mistakeWords.length} từ) →
                </button>
              )}
            </div>

            {mistakeWords.length === 0 ? (
              <div className="studio-card rounded-2xl border p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400 dark:bg-stone-800">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="mt-4 text-base font-bold text-stone-900 dark:text-stone-100">
                  Sổ tay sạch sẽ! Chưa có từ nào bị ghi nhận sai.
                </h4>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  Khi bạn làm bài kiểm tra hoặc lật thẻ chọn &ldquo;Chưa thuộc&rdquo;, từ sẽ tự động xuất hiện ở đây để bạn dễ dàng ôn lại.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {mistakeWords.map((word) => {
                  const prog = getWordProgress(studyData, word.id);
                  return (
                    <div
                      key={word.id}
                      onClick={() => onSelectWord(word)}
                      className="studio-card group relative flex flex-col justify-between rounded-xl border border-red-200/80 p-4 transition-all hover:border-red-400 cursor-pointer dark:border-red-950/80 dark:hover:border-red-800"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-2xs font-bold text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300">
                            Sai {prog.mistakeCount} lần
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleClearMistake(e, word.id)}
                            title="Xóa khỏi sổ lỗi"
                            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-2xs"
                          >
                            Đã thuộc ✕
                          </button>
                        </div>

                        <div className="mt-3">
                          <div className="font-mono text-xs font-semibold text-[#b84a27] dark:text-[#f39a7d]">
                            {word.pinyin}
                          </div>
                          <div className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
                            {word.word}
                          </div>
                        </div>

                        <div className="mt-1.5 text-2xs font-semibold text-amber-800 dark:text-amber-300">
                          HV: {word.hanviet}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-stone-800 line-clamp-2 dark:text-stone-200">
                          {word.meaningVi}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2 text-2xs dark:border-stone-800/80">
                        <span className="text-stone-400">HSK {word.level}</span>
                        <button
                          type="button"
                          onClick={(e) => handlePlayAudio(e, word)}
                          className="text-[#b84a27] hover:underline dark:text-[#f39a7d]"
                        >
                          🔊 Phát âm
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Starred Words */}
        {activeTab === "starred" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                  Từ vựng quan trọng đã lưu (⭐️)
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Danh sách những từ bạn tự đánh dấu sao để tra cứu và luyện tập riêng
                </p>
              </div>

              {starredWords.length > 0 && (
                <button
                  type="button"
                  onClick={() => onStartReviewSession(starredWords)}
                  className="rounded-xl border border-amber-500 bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600"
                >
                  Luyện tập nhóm từ đã lưu ({starredWords.length} từ) →
                </button>
              )}
            </div>

            {starredWords.length === 0 ? (
              <div className="studio-card rounded-2xl border p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/60">
                  ★
                </div>
                <h4 className="mt-4 text-base font-bold text-stone-900 dark:text-stone-100">
                  Chưa có từ nào được đánh dấu sao
                </h4>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  Bạn có thể nhấn biểu tượng ngôi sao ⭐️ ở bất kỳ thẻ từ nào trong mục &ldquo;Tra từ&rdquo; để thêm vào đây.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {starredWords.map((word) => (
                  <ReviewWordCard
                    key={word.id}
                    word={word}
                    studyData={studyData}
                    isPlaying={playingWordId === word.id}
                    onPlayAudio={(e) => handlePlayAudio(e, word)}
                    onSelect={() => onSelectWord(word)}
                    onToggleStar={(e) => handleToggleStar(e, word.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Mastered Words */}
        {activeTab === "mastered" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Từ vựng đã nắm vững lâu dài ({masteredWords.length} / 1000 từ)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Các từ đã vượt qua nhiều lần kiểm tra Spaced Repetition thành công
              </p>
            </div>

            {masteredWords.length === 0 ? (
              <div className="studio-card rounded-2xl border p-12 text-center">
                <h4 className="text-base font-bold text-stone-800 dark:text-stone-200">
                  Chưa có từ nào đạt cấp độ nắm vững hoàn toàn
                </h4>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  Hãy tiếp tục học Flashcards và kiểm tra hàng ngày để đưa các từ vựng vào danh sách này!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {masteredWords.map((word) => (
                  <ReviewWordCard
                    key={word.id}
                    word={word}
                    studyData={studyData}
                    isPlaying={playingWordId === word.id}
                    onPlayAudio={(e) => handlePlayAudio(e, word)}
                    onSelect={() => onSelectWord(word)}
                    onToggleStar={(e) => handleToggleStar(e, word.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewWordCard({
  word,
  studyData,
  isPlaying,
  onPlayAudio,
  onSelect,
  onToggleStar,
}: {
  word: HskWord;
  studyData: UserStudyData;
  isPlaying: boolean;
  onPlayAudio: (e: React.MouseEvent) => void;
  onSelect: () => void;
  onToggleStar: (e: React.MouseEvent) => void;
}) {
  const progress = getWordProgress(studyData, word.id);

  return (
    <div
      onClick={onSelect}
      className="studio-card group relative flex flex-col justify-between rounded-xl border p-4 transition-all hover:border-[#b84a27]/60 hover:shadow-xs cursor-pointer dark:hover:border-[#e06d48]/60"
    >
      <div>
        <div className="flex items-center justify-between">
          <span
            className={`rounded-md border px-1.5 py-0.5 text-2xs font-semibold ${getLevelBadgeClass(
              word.level
            )}`}
          >
            HSK {word.level}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPlayAudio}
              className={`rounded-lg p-1 ${
                isPlaying ? "text-[#b84a27]" : "text-stone-400 hover:text-stone-700"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onToggleStar}
              className={`rounded-lg p-1 ${
                progress.starred ? "text-amber-500" : "text-stone-300 hover:text-stone-600"
              }`}
            >
              ★
            </button>
          </div>
        </div>

        <div className="mt-3">
          <div className="font-mono text-xs font-semibold text-[#b84a27] dark:text-[#f39a7d]">
            {word.pinyin}
          </div>
          <div className="font-serif text-3xl font-bold text-stone-900 group-hover:text-[#b84a27] dark:text-stone-100 dark:group-hover:text-[#f39a7d]">
            {word.word}
          </div>
        </div>

        <div className="mt-1 text-2xs font-semibold text-amber-800 dark:text-amber-300">
          HV: {word.hanviet}
        </div>
        <div className="mt-1 text-xs font-semibold text-stone-800 line-clamp-2 dark:text-stone-200">
          {word.meaningVi}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2 text-2xs dark:border-stone-800">
        <span
          className={`rounded-md border px-1.5 py-0.5 font-medium ${getStatusBadgeClass(
            progress.status
          )}`}
        >
          {progress.status === "mastered"
            ? "Đã thuộc"
            : progress.status === "learning"
            ? "Đang học"
            : "Chưa học"}
        </span>
        <span className="text-stone-400 group-hover:text-[#b84a27]">Xem →</span>
      </div>
    </div>
  );
}

