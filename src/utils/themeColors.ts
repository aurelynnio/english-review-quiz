export type BadgeTone =
  | "terracotta"
  | "sage"
  | "ochre"
  | "navy"
  | "plum"
  | "carmine";

const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  terracotta:
    "border-[#e2bfb0] bg-[#faece6] text-[#8f3416] dark:border-[#6e3422] dark:bg-[#331911]/80 dark:text-[#f3a68c]",
  sage:
    "border-[#b7d3c4] bg-[#e6f2ec] text-[#184e38] dark:border-[#285440] dark:bg-[#12291f]/80 dark:text-[#86d9b3]",
  ochre:
    "border-[#e3cc9e] bg-[#fbf2df] text-[#7c5110] dark:border-[#664919] dark:bg-[#2e210b]/80 dark:text-[#f0c775]",
  navy:
    "border-[#bccce3] bg-[#eaeff7] text-[#1d3961] dark:border-[#2c4469] dark:bg-[#132033]/80 dark:text-[#98bae8]",
  plum:
    "border-[#d9bdd0] bg-[#f6ebf2] text-[#662b50] dark:border-[#5c2c4a] dark:bg-[#2b1423]/80 dark:text-[#e6a5ce]",
  carmine:
    "border-[#e3bfc0] bg-[#faebeb] text-[#8c262b] dark:border-[#662629] dark:bg-[#301214]/80 dark:text-[#f29d9f]",
};

const DOT_TONE_CLASSES: Record<BadgeTone, string> = {
  terracotta: "bg-[#b84a27] dark:bg-[#e07a5f]",
  sage: "bg-[#1f5c44] dark:bg-[#52b788]",
  ochre: "bg-[#b47b28] dark:bg-[#e0a96d]",
  navy: "bg-[#25416b] dark:bg-[#7ca5de]",
  plum: "bg-[#6e3556] dark:bg-[#d48ab8]",
  carmine: "bg-[#9e3337] dark:bg-[#e57373]",
};

const TOP_BORDER_TONE_CLASSES: Record<BadgeTone, string> = {
  terracotta: "studio-card border-l-[3px] border-l-[#b84a27] dark:border-l-[#e07a5f]",
  sage: "studio-card border-l-[3px] border-l-[#1f5c44] dark:border-l-[#52b788]",
  ochre: "studio-card border-l-[3px] border-l-[#b47b28] dark:border-l-[#e0a96d]",
  navy: "studio-card border-l-[3px] border-l-[#25416b] dark:border-l-[#7ca5de]",
  plum: "studio-card border-l-[3px] border-l-[#6e3556] dark:border-l-[#d48ab8]",
  carmine: "studio-card border-l-[3px] border-l-[#9e3337] dark:border-l-[#e57373]",
};

const HEADER_BAND_TONE_CLASSES: Record<BadgeTone, string> = {
  terracotta:
    "border-[#eaded2] bg-[#f7efe6]/80 dark:border-[#302721] dark:bg-[#231c17]/70",
  sage:
    "border-[#dce7e0] bg-[#eef5f0]/80 dark:border-[#23332b] dark:bg-[#17231d]/70",
  ochre:
    "border-[#eadfce] bg-[#f8f2e7]/80 dark:border-[#332a1d] dark:bg-[#241e15]/70",
  navy:
    "border-[#dce3ed] bg-[#eef2f7]/80 dark:border-[#242e3d] dark:bg-[#171e29]/70",
  plum:
    "border-[#e8dce4] bg-[#f5eef3]/80 dark:border-[#33232d] dark:bg-[#23181f]/70",
  carmine:
    "border-[#eadcdf] bg-[#f7eef0]/80 dark:border-[#362325] dark:bg-[#241719]/70",
};

const SUBMIT_BUTTON_TONE_CLASSES: Record<BadgeTone, string> = {
  terracotta:
    "border-[#9e3c1e] bg-[#b84a27] text-white hover:bg-[#9e3c1e] dark:border-[#e07a5f] dark:bg-[#d46543] dark:text-white dark:hover:bg-[#e07a5f]",
  sage:
    "border-[#174936] bg-[#1f5c44] text-white hover:bg-[#174936] dark:border-[#52b788] dark:bg-[#2d7a5b] dark:text-white dark:hover:bg-[#38916d]",
  ochre:
    "border-[#8a5a14] bg-[#a36c1d] text-white hover:bg-[#8a5a14] dark:border-[#e0a96d] dark:bg-[#b87d24] dark:text-white dark:hover:bg-[#cc8e30]",
  navy:
    "border-[#1b3152] bg-[#25416b] text-white hover:bg-[#1b3152] dark:border-[#7ca5de] dark:bg-[#355a91] dark:text-white dark:hover:bg-[#426ba8]",
  plum:
    "border-[#562743] bg-[#6e3556] text-white hover:bg-[#562743] dark:border-[#d48ab8] dark:bg-[#87436b] dark:text-white dark:hover:bg-[#9c507d]",
  carmine:
    "border-[#7d2629] bg-[#9e3337] text-white hover:bg-[#7d2629] dark:border-[#e57373] dark:bg-[#b54045] dark:text-white dark:hover:bg-[#c94e53]",
};

export function getFormatTone(headerBadge?: string): BadgeTone {
  const lower = (headerBadge || "").toLowerCase();
  if (lower.includes("multiple choice")) return "sage";
  if (lower.includes("true") || lower.includes("false")) return "plum";
  if (lower.includes("fill") || lower.includes("gap")) return "ochre";
  if (lower.includes("reorder")) return "navy";
  if (lower.includes("error")) return "carmine";
  if (lower.includes("sign") || lower.includes("notice")) return "ochre";
  if (lower.includes("match")) return "navy";
  return "terracotta";
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

export function getHeaderBandClasses(headerBadge?: string): string {
  return HEADER_BAND_TONE_CLASSES[getFormatTone(headerBadge)];
}

export function getSubmitButtonClasses(headerBadge?: string): string {
  return SUBMIT_BUTTON_TONE_CLASSES[getFormatTone(headerBadge)];
}


