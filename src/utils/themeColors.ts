export type BadgeTone =
  | "indigo"
  | "violet"
  | "sky"
  | "amber"
  | "teal"
  | "rose"
  | "cyan";

const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  indigo:
    "border-indigo-200/90 bg-indigo-50/90 text-indigo-700 dark:border-indigo-800/80 dark:bg-indigo-950/60 dark:text-indigo-300",
  violet:
    "border-violet-200/90 bg-violet-50/90 text-violet-700 dark:border-violet-800/80 dark:bg-violet-950/60 dark:text-violet-300",
  sky: "border-sky-200/90 bg-sky-50/90 text-sky-700 dark:border-sky-800/80 dark:bg-sky-950/60 dark:text-sky-300",
  amber:
    "border-amber-200/90 bg-amber-50/90 text-amber-800 dark:border-amber-800/80 dark:bg-amber-950/60 dark:text-amber-300",
  teal: "border-teal-200/90 bg-teal-50/90 text-teal-700 dark:border-teal-800/80 dark:bg-teal-950/60 dark:text-teal-300",
  rose: "border-rose-200/90 bg-rose-50/90 text-rose-700 dark:border-rose-800/80 dark:bg-rose-950/60 dark:text-rose-300",
  cyan: "border-cyan-200/90 bg-cyan-50/90 text-cyan-700 dark:border-cyan-800/80 dark:bg-cyan-950/60 dark:text-cyan-300",
};

const DOT_TONE_CLASSES: Record<BadgeTone, string> = {
  indigo: "bg-indigo-500 dark:bg-indigo-400",
  violet: "bg-violet-500 dark:bg-violet-400",
  sky: "bg-sky-500 dark:bg-sky-400",
  amber: "bg-amber-500 dark:bg-amber-400",
  teal: "bg-teal-500 dark:bg-teal-400",
  rose: "bg-rose-500 dark:bg-rose-400",
  cyan: "bg-cyan-500 dark:bg-cyan-400",
};

const TOP_BORDER_TONE_CLASSES: Record<BadgeTone, string> = {
  indigo: "border-t-indigo-500/80 dark:border-t-indigo-400/80",
  violet: "border-t-violet-500/80 dark:border-t-violet-400/80",
  sky: "border-t-sky-500/80 dark:border-t-sky-400/80",
  amber: "border-t-amber-500/80 dark:border-t-amber-400/80",
  teal: "border-t-teal-500/80 dark:border-t-teal-400/80",
  rose: "border-t-rose-500/80 dark:border-t-rose-400/80",
  cyan: "border-t-cyan-500/80 dark:border-t-cyan-400/80",
};

const SUBMIT_BUTTON_TONE_CLASSES: Record<BadgeTone, string> = {
  indigo:
    "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 dark:border-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500",
  violet:
    "border-violet-600 bg-violet-600 text-white hover:bg-violet-700 dark:border-violet-500 dark:bg-violet-600 dark:hover:bg-violet-500",
  sky: "border-sky-600 bg-sky-600 text-white hover:bg-sky-700 dark:border-sky-500 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400",
  amber:
    "border-amber-600 bg-amber-600 text-white hover:bg-amber-700 dark:border-amber-500 dark:bg-amber-500 dark:text-neutral-950 dark:hover:bg-amber-400",
  teal: "border-teal-600 bg-teal-600 text-white hover:bg-teal-700 dark:border-teal-500 dark:bg-teal-500 dark:text-white dark:hover:bg-teal-400",
  rose: "border-rose-600 bg-rose-600 text-white hover:bg-rose-700 dark:border-rose-500 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400",
  cyan: "border-cyan-600 bg-cyan-600 text-white hover:bg-cyan-700 dark:border-cyan-500 dark:bg-cyan-500 dark:text-neutral-950 dark:hover:bg-cyan-400",
};

export function getFormatTone(headerBadge?: string): BadgeTone {
  const lower = (headerBadge || "").toLowerCase();
  if (lower.includes("multiple choice")) return "sky";
  if (lower.includes("true") || lower.includes("false")) return "violet";
  if (lower.includes("fill") || lower.includes("gap")) return "amber";
  if (lower.includes("reorder")) return "teal";
  if (lower.includes("error")) return "rose";
  if (lower.includes("sign") || lower.includes("notice")) return "amber";
  if (lower.includes("match")) return "cyan";
  return "indigo";
}

export function getBadgeClasses(headerBadge?: string): string {
  return BADGE_TONE_CLASSES[getFormatTone(headerBadge)];
}

export function getDotClasses(headerBadge?: string): string {
  return DOT_TONE_CLASSES[getFormatTone(headerBadge)];
}

export function getTopBorderClasses(headerBadge?: string): string {
  return TOP_BORDER_TONE_CLASSES[getFormatTone(headerBadge)];
}

export function getSubmitButtonClasses(headerBadge?: string): string {
  return SUBMIT_BUTTON_TONE_CLASSES[getFormatTone(headerBadge)];
}

