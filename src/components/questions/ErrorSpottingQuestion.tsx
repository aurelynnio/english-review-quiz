"use client";

import React from "react";
import {
  getBadgeClasses,
  getDotClasses,
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
  const topBorder = getTopBorderClasses(badgeLabel);
  const dotColor = getDotClasses(badgeLabel);
  const badgeColor = getBadgeClasses(badgeLabel);
  const submitBtnClass = getSubmitButtonClasses(badgeLabel);

  return (
    <div
      className={`rounded-2xl border border-t-2 border-neutral-200/80 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900 ${topBorder}`}
    >
      <div className="mb-3.5 flex items-center justify-between gap-2 border-b border-neutral-100 pb-3 dark:border-neutral-800/80">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
          {indexLabel}
        </span>
        <div className="flex items-center gap-2">
          {headerBadge && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeColor}`}
            >
              {headerBadge}
            </span>
          )}
          {submitted && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                isFullyCorrect
                  ? "border-green-300 bg-green-50 text-green-800 dark:border-green-700/80 dark:bg-green-950/60 dark:text-green-300"
                  : "border-red-300 bg-red-50 text-red-800 dark:border-red-700/80 dark:bg-red-950/60 dark:text-red-300"
              }`}
            >
              {isFullyCorrect ? "Correct" : "Incorrect"}
            </span>
          )}
        </div>
      </div>

      <p className="mb-2 text-xs font-semibold text-rose-700 dark:text-rose-400">
        Step 1: Click the erroneous segment in the sentence below.
      </p>

      <div className="mb-5 flex flex-wrap items-center gap-1.5 rounded-xl border border-rose-200/70 bg-rose-50/25 p-4 text-base leading-relaxed dark:border-rose-900/50 dark:bg-rose-950/15">
        {segments.map((seg) => {
          const isSelected = selectedSegmentId === seg.id;
          const isActualError = seg.id === correctSegmentId;

          let segClass =
            "border-neutral-200/90 bg-white text-neutral-900 shadow-2xs hover:border-rose-400 hover:bg-rose-50/50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-rose-500 dark:hover:bg-rose-950/40";

          if (!submitted && isSelected) {
            segClass =
              "border-rose-500 bg-rose-50 text-rose-950 font-semibold shadow-xs dark:border-rose-400 dark:bg-rose-950/70 dark:text-rose-100";
          } else if (submitted) {
            if (isActualError) {
              segClass =
                "border-green-400 bg-green-50 text-green-900 line-through font-medium dark:border-green-700 dark:bg-green-950/60 dark:text-green-200";
            } else if (isSelected && !isActualError) {
              segClass =
                "border-red-400 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950/60 dark:text-red-200";
            } else {
              segClass =
                "border-transparent bg-transparent text-neutral-700 dark:text-neutral-400";
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

      <p className="mb-2 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
        Step 2: Select the correct replacement for the error.
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {correctionOptions.map((opt, idx) => {
          const isSelected = selectedCorrection === opt;
          const isRight = opt === correctReplacement;

          let optStyle =
            "border-neutral-200/90 bg-neutral-50/40 text-neutral-800 hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-200 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30";
          if (!submitted && isSelected) {
            optStyle =
              "border-indigo-500 bg-indigo-50/90 text-indigo-950 font-semibold shadow-2xs dark:border-indigo-400 dark:bg-indigo-950/60 dark:text-indigo-100";
          } else if (submitted) {
            if (isRight) {
              optStyle =
                "border-green-400 bg-green-50/80 text-green-900 font-medium dark:border-green-700 dark:bg-green-950/50 dark:text-green-200";
            } else if (isSelected && !isRight) {
              optStyle =
                "border-red-400 bg-red-50/80 text-red-900 line-through dark:border-red-700 dark:bg-red-950/50 dark:text-red-200";
            } else {
              optStyle =
                "border-neutral-200/60 bg-neutral-50/50 text-neutral-400 dark:border-neutral-800/60 dark:bg-neutral-900/50 dark:text-neutral-600";
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
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3.5 dark:border-neutral-800/80">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {selectedSegmentId && selectedCorrection
              ? "Both Step 1 and Step 2 selected — click Submit to check."
              : "Complete Step 1 (error segment) and Step 2 (replacement), then click Submit."}
          </span>
          <button
            type="button"
            onClick={onSubmit}
            className={`rounded-xl border px-4 py-1.5 text-xs font-semibold shadow-2xs transition-all ${submitBtnClass}`}
          >
            Submit Answer
          </button>
        </div>
      )}

      {submitted && (
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-neutral-100 pt-3.5 text-xs text-neutral-700 dark:border-neutral-800/80 dark:text-neutral-300">
          <div className="space-y-1">
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                Error Segment:{" "}
              </span>
              <span className="text-red-700 line-through dark:text-red-400">
                {segments.find((s) => s.id === correctSegmentId)?.text}
              </span>
              <span className="mx-2 text-neutral-400">→</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                Correction:{" "}
              </span>
              <span className="font-medium text-green-700 dark:text-green-400">
                {correctReplacement}
              </span>
            </div>
            {note && (
              <div className="text-neutral-600 dark:text-neutral-400">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
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
              className="shrink-0 rounded-xl border border-neutral-200/90 bg-neutral-50/80 px-3.5 py-1.5 text-xs font-medium text-neutral-700 transition-all hover:border-neutral-400 hover:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
            >
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
