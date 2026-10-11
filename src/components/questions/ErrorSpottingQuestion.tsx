"use client";

import React from "react";

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
}: ErrorSpottingQuestionProps) {
  const spottedRightSegment = selectedSegmentId === correctSegmentId;
  const pickedRightCorrection = selectedCorrection === correctReplacement;
  const isFullyCorrect =
    submitted && spottedRightSegment && pickedRightCorrection;

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs dark:border-neutral-800/90 dark:bg-neutral-900">
      <div className="mb-3.5 flex items-center justify-between gap-2 border-b border-neutral-100 pb-3 dark:border-neutral-800/80">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {indexLabel}
        </span>
        <div className="flex items-center gap-2">
          {headerBadge && (
            <span className="rounded-full border border-neutral-200/80 bg-neutral-100/70 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600 dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-300">
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

      <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        Step 1: Click the erroneous segment in the sentence below.
      </p>

      <div className="mb-5 flex flex-wrap items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-4 text-base leading-relaxed dark:border-neutral-800 dark:bg-neutral-950/70">
        {segments.map((seg) => {
          const isSelected = selectedSegmentId === seg.id;
          const isActualError = seg.id === correctSegmentId;

          let segClass =
            "border-neutral-200/90 bg-white text-neutral-900 shadow-2xs hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-500 dark:hover:bg-neutral-800";

          if (!submitted && isSelected) {
            segClass =
              "border-neutral-900 bg-neutral-900 text-white font-medium shadow-xs dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900";
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

      <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        Step 2: Select the correct replacement for the error.
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {correctionOptions.map((opt, idx) => {
          const isSelected = selectedCorrection === opt;
          const isRight = opt === correctReplacement;

          let optStyle =
            "border-neutral-200/90 bg-neutral-50/40 text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-200 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/60";
          if (!submitted && isSelected) {
            optStyle =
              "border-neutral-900 bg-neutral-900 text-white font-medium shadow-2xs dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900";
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

      {submitted && (
        <div className="mt-4 border-t border-neutral-100 pt-3.5 text-xs text-neutral-700 dark:border-neutral-800/80 dark:text-neutral-300">
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
            <div className="mt-1 text-neutral-600 dark:text-neutral-400">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                Note:{" "}
              </span>
              {note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
