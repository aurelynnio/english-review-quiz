"use client";

import React, { useRef, useState, useMemo } from "react";
import { HSK_WORDS } from "@/data/hskWords";
import {
  UserStudyData,
  getWordProgress,
  saveStudyData,
  getDefaultStudyData,
} from "@/utils/hskUtils";

interface StatsSectionProps {
  studyData: UserStudyData;
  onUpdateStudyData: (nextData: UserStudyData) => void;
}

export function StatsSection({
  studyData,
  onUpdateStudyData,
}: StatsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Overall counts
  const stats = useMemo(() => {
    let mastered = 0;
    let learning = 0;
    let unlearned = 0;
    let starred = 0;
    let mistakes = 0;

    const levelStats = {
      1: { total: 300, mastered: 0, learning: 0 },
      2: { total: 200, mastered: 0, learning: 0 },
      3: { total: 500, mastered: 0, learning: 0 },
    };

    HSK_WORDS.forEach((w) => {
      const prog = getWordProgress(studyData, w.id);
      if (prog.status === "mastered") {
        mastered++;
        if (levelStats[w.level as 1 | 2 | 3]) levelStats[w.level as 1 | 2 | 3].mastered++;
      } else if (prog.status === "learning") {
        learning++;
        if (levelStats[w.level as 1 | 2 | 3]) levelStats[w.level as 1 | 2 | 3].learning++;
      } else {
        unlearned++;
      }

      if (prog.starred) starred++;
      if (prog.mistakeCount > 0) mistakes++;
    });

    const masteredPercent = Math.round((mastered / 1000) * 100);

    return {
      mastered,
      learning,
      unlearned,
      starred,
      mistakes,
      masteredPercent,
      levelStats,
    };
  }, [studyData]);

  // Export JSON backup
  const handleExportData = () => {
    const jsonStr = JSON.stringify(studyData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hsk3_progress_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as UserStudyData;
        if (parsed && typeof parsed.words === "object") {
          saveStudyData(parsed);
          onUpdateStudyData(parsed);
          setImportMessage("Khôi phục tiến độ thành công! 🎉");
          setTimeout(() => setImportMessage(null), 3500);
        } else {
          setImportMessage("Tệp tin không đúng định dạng dữ liệu HSK.");
        }
      } catch {
        setImportMessage("Lỗi khi đọc tệp sao lưu JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Reset progress
  const handleReset = () => {
    const fresh = getDefaultStudyData();
    saveStudyData(fresh);
    onUpdateStudyData(fresh);
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Mastered Gauge */}
        <div className="studio-card rounded-2xl border p-6 shadow-xs sm:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-2xs font-bold tracking-wider text-stone-500 uppercase dark:text-stone-400">
                Tổng quan nắm vững 1000 từ HSK 3.0
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-extrabold text-[#b84a27] dark:text-[#f39a7d]">
                  {stats.mastered}
                </span>
                <span className="text-base font-bold text-stone-400">/ 1000 từ</span>
                <span className="ml-2 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {stats.masteredPercent}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span>Đã thuộc ({stats.mastered})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span>Đang học ({stats.learning})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-stone-300 dark:bg-stone-700" />
                <span>Chưa học ({stats.unlearned})</span>
              </div>
            </div>
          </div>

          {/* Large Segmented Progress Bar */}
          <div className="mt-5 h-4 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            <div className="flex h-full w-full">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${(stats.mastered / 1000) * 100}%` }}
                title={`Đã thuộc: ${stats.mastered} từ`}
              />
              <div
                className="bg-amber-500 transition-all duration-500"
                style={{ width: `${(stats.learning / 1000) * 100}%` }}
                title={`Đang học: ${stats.learning} từ`}
              />
            </div>
          </div>
        </div>

        {/* Streak & Activity Card */}
        <div className="studio-card flex flex-col justify-between rounded-2xl border p-6 shadow-xs">
          <div>
            <div className="text-2xs font-bold tracking-wider text-stone-500 uppercase dark:text-stone-400">
              Chuỗi ngày học tập
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-4xl">🔥</span>
              <div>
                <div className="font-serif text-3xl font-extrabold text-stone-900 dark:text-stone-100">
                  {studyData.streakDays || 1} Ngày
                </div>
                <div className="text-xs text-stone-500">Duy trì đều đặn mỗi ngày</div>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-stone-200/70 pt-3 text-xs text-stone-600 dark:border-stone-800 dark:text-stone-400">
            Tổng lượt ôn tập hoàn tất:{" "}
            <span className="font-bold text-[#b84a27] dark:text-[#f39a7d]">
              {studyData.totalReviewsCompleted || 0} lượt
            </span>
          </div>
        </div>
      </div>

      {/* Level Breakdown Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* HSK 1 */}
        <div className="studio-card rounded-2xl border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="rounded-md border border-[#b7d3c4] bg-[#e6f2ec] px-2 py-0.5 text-xs font-bold text-[#184e38] dark:border-[#285440] dark:bg-[#12291f] dark:text-[#86d9b3]">
              HSK 1 (Cơ bản)
            </span>
            <span className="text-xs font-bold text-stone-500">300 từ</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
              {stats.levelStats[1].mastered}{" "}
              <span className="text-xs font-normal text-stone-400">đã thuộc</span>
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {Math.round((stats.levelStats[1].mastered / 300) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${(stats.levelStats[1].mastered / 300) * 100}%` }}
            />
          </div>
        </div>

        {/* HSK 2 */}
        <div className="studio-card rounded-2xl border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="rounded-md border border-[#bccce3] bg-[#eaeff7] px-2 py-0.5 text-xs font-bold text-[#1d3961] dark:border-[#2c4469] dark:bg-[#132033] dark:text-[#98bae8]">
              HSK 2 (Sơ cấp)
            </span>
            <span className="text-xs font-bold text-stone-500">200 từ</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
              {stats.levelStats[2].mastered}{" "}
              <span className="text-xs font-normal text-stone-400">đã thuộc</span>
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {Math.round((stats.levelStats[2].mastered / 200) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${(stats.levelStats[2].mastered / 200) * 100}%` }}
            />
          </div>
        </div>

        {/* HSK 3 */}
        <div className="studio-card rounded-2xl border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="rounded-md border border-[#e2bfb0] bg-[#faece6] px-2 py-0.5 text-xs font-bold text-[#8f3416] dark:border-[#6e3422] dark:bg-[#331911] dark:text-[#f3a68c]">
              HSK 3 (Trung cấp)
            </span>
            <span className="text-xs font-bold text-stone-500">500 từ</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
              {stats.levelStats[3].mastered}{" "}
              <span className="text-xs font-normal text-stone-400">đã thuộc</span>
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {Math.round((stats.levelStats[3].mastered / 500) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${(stats.levelStats[3].mastered / 500) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Data Backup & Management */}
      <div className="studio-card rounded-2xl border p-6 shadow-xs">
        <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
          Quản lý Dữ liệu & Sao lưu Tiến độ
        </h3>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          Dữ liệu của bạn được lưu an toàn trong trình duyệt (localStorage). Bạn có thể xuất tệp JSON để chuyển đổi giữa điện thoại và máy tính hoặc lưu trữ an toàn.
        </p>

        {importMessage && (
          <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
            {importMessage}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportData}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 shadow-2xs hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          >
            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Xuất bản sao lưu (.json)</span>
          </button>

          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 shadow-2xs hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          >
            <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span>Nhập khôi phục từ tệp (.json)</span>
          </button>

          {/* Reset progress */}
          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="ml-auto rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-950 dark:bg-stone-900 dark:text-red-400"
            >
              Đặt lại tiến độ
            </button>
          ) : (
            <div className="ml-auto flex items-center gap-2 animate-in fade-in">
              <span className="text-xs text-red-600 dark:text-red-400">Chắc chắn xóa?</span>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
              >
                Xóa tất cả
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300"
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

