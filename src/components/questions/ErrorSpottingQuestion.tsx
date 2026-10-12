"use client";

import React from "react";
import {
  getBadgeClasses,
  getDotClasses,
  getHeaderBandClasses,
  getSubmitButtonClasses,
  getTopBorderClasses,
} from "@/utils/themeColors";

export interface ErrorSegment {
  id: string;
  text: string;
  isErrorTarget: boolean;
}

export interface ErrorSpottingQuestionProps {
  indexLabel: string;
  segments: ErrorSegment[];
  correctionOptions: string[];
  selectedSegmentId?: string;
  selectedCorrection?: string;
  correctSegmentId: string;
  correctReplacement: string;
  submitted: boolean;
  note?: string;
  headerBadge?: string;
  onSelectSegment: (segmentId: string) => void;
  onSelectCorrection: (correction: string) => void;
  onSubmit?: () => void;
  onReset?: () => void;
}

export function ErrorSpottingQuestion({
  indexLabel,
  segments,
  correctionOptions,
  selectedSegmentId,
  selectedCorrection,
  correctSegmentId,
  correctReplacement,
  submitted,
  note,
  headerBadge,
  onSelectSegment,
  onSelectCorrection,
  onSubmit,
  onReset,
}: ErrorSpottingQuestionProps) {
  const spottedRightSegment = selectedSegmentId === correctSegmentId;
  const pickedRightCorrection = selectedCorrection === correctReplacement;
  const isFullyCorrect =
    submitted && spottedRightSegment && pickedRightCorrection;
  const badgeLabel = headerBadge || "Error Spotting";
  const leftBorder = getTopBorderClasses(badgeLabel);
  const headerBand = getHeaderBandClasses(badgeLabel);
  const dotColor = getDotClasses(badgeLabel);
  const badgeColor = getBadgeClasses(badgeLabel);
  const submitBtnClass = getSubmitButtonClasses(badgeLabel);

  return (
    <div
      className={`studio-card overflow-hidden rounded-2xl border border-l-[3px] transition-all ${leftBorder}`}
    >
      {/* Tinted Editorial Header Band */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 border-b px-6 py-3 ${headerBand}`}
      >
        <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wide text-stone-700 dark:text-stone-200">
          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
          {indexLabel}
        </span>
        <div className="flex items-center gap-2">
          {headerBadge && (
            <span
              className={`rounded-md border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${badgeColor}`}
            >
              {headerBadge}
            </span>
          )}
          {submitted && (
            <span
              className={`rounded-md border px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase ${
                isFullyCorrect
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-700/80 dark:bg-rose-950/60 dark:text-rose-300"
              }`}
            >
              {isFullyCorrect ? "✓ Correct" : "✗ Incorrect"}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <p className="mb-2 font-mono text-[11px] font-bold tracking-wider uppercase text-[#9e3337] dark:text-[#f2a7aa]">
          Step 1: Click the erroneous segment in the sentence below
        </p>

        <div className="mb-5 flex flex-wrap items-center gap-1.5 rounded-xl border border-[#ebbfc1]/80 bg-[#fcedee]/40 p-4 text-base leading-relaxed dark:border-[#6e2124] dark:bg-[#2b1214]/35">
          {segments.map((seg) => {
            const isSelected = selectedSegmentId === seg.id;
            const isActualError = seg.id === correctSegmentId;

            let segClass =
              "border-stone-200/90 bg-white text-stone-900 shadow-2xs hover:border-[#9e3337] hover:bg-[#fcedee]/60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-[#d96266] dark:hover:bg-[#2b1214]/50";

            if (!submitted && isSelected) {
              segClass =
                "border-[#9e3337] bg-[#fcedee] text-[#732124] font-semibold shadow-xs dark:border-[#d96266] dark:bg-[#2b1214] dark:text-[#f2a7aa]";
            } else if (submitted) {
              if (isActualError) {
                segClass =
                  "border-emerald-500 bg-emerald-50 text-emerald-900 line-through font-semibold dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200";
              } else if (isSelected && !isActualError) {
                segClass =
                  "border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-200";
              } else {
                segClass =
                  "border-transparent bg-transparent text-stone-700 dark:text-stone-400";
              }
            }

            return (
              <button
                key={seg.id}
                type="button"
                disabled={submitted}
                onClick={() => onSelectSegment(seg.id)}
                className={`rounded-lg border px-2.5 py-1 text-sm transition-all ${segClass} ${
                  submitted ? "cursor-default" : "cursor-pointer"
                }`}
              >
                {seg.text}
              </button>
            );
          })}
        </div>

        <p className="mb-2 font-mono text-[11px] font-bold tracking-wider uppercase text-[#25416b] dark:text-[#acc4e8]">
          Step 2: Select the correct replacement for the error
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {correctionOptions.map((opt, idx) => {
            const isSelected = selectedCorrection === opt;
            const isRight = opt === correctReplacement;

            let optStyle =
              "border-stone-200/90 bg-stone-50/50 text-stone-800 hover:border-[#25416b]/50 hover:bg-[#edf2f8]/50 dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-200 dark:hover:border-[#527bb8] dark:hover:bg-[#132036]/40";
            if (!submitted && isSelected) {
              optStyle =
                "border-[#25416b] bg-[#edf2f8] text-[#1b3152] font-semibold shadow-2xs dark:border-[#6894d4] dark:bg-[#132036] dark:text-[#acc4e8]";
            } else if (submitted) {
              if (isRight) {
                optStyle =
                  "border-emerald-500 bg-emerald-50/80 text-emerald-900 font-semibold dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200";
              } else if (isSelected && !isRight) {
                optStyle =
                  "border-rose-400 bg-rose-50/80 text-rose-900 line-through dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-200";
              } else {
                optStyle =
                  "border-stone-200/60 bg-stone-50/40 text-stone-400 dark:border-stone-800/60 dark:bg-stone-900/40 dark:text-stone-600";
              }
            }

            return (
              <button
                key={`${opt}-${idx}`}
                type="button"
                disabled={submitted}
                onClick={() => onSelectCorrection(opt)}
                className={`rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all ${optStyle} ${
                  submitted ? "cursor-default" : "cursor-pointer"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {!submitted && onSubmit && (
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-200/70 pt-4 dark:border-stone-800/80">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {selectedSegmentId && selectedCorrection
                ? "Both Step 1 and Step 2 selected — click Submit to check."
                : "Complete Step 1 (error segment) and Step 2 (replacement), then click Submit."}
            </span>
            <button
              type="button"
              onClick={onSubmit}
              className={`rounded-xl border px-4 py-2 text-xs font-semibold shadow-2xs transition-all ${submitBtnClass}`}
            >
              Submit Answer
            </button>
          </div>
        )}

        {submitted && (
          <div className="mt-5 flex flex-wrap items-start justify-between gap-3 border-t border-stone-200/70 pt-4 text-xs text-stone-700 dark:border-stone-800/80 dark:text-stone-300">
            <div className="space-y-1">
              <div>
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  Error Segment:{" "}
                </span>
                <span className="text-rose-700 line-through dark:text-rose-400">
                  {segments.find((s) => s.id === correctSegmentId)?.text}
                </span>
                <span className="mx-2 text-stone-400">→</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  Correction:{" "}
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {correctReplacement}
                </span>
              </div>
              {note && (
                <div className="text-stone-600 dark:text-stone-400">
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    Note:{" "}
                  </span>
                  {note}
                </div>
              )}
            </div>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="shrink-0 rounded-xl border border-stone-300/90 bg-stone-100/80 px-3.5 py-1.5 text-xs font-semibold text-stone-700 transition-all hover:border-stone-400 hover:bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-stone-500 dark:hover:bg-stone-800"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
