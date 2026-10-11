export interface DiffToken {
  type: "correct" | "wrong" | "missing";
  text: string;
}

export interface WritingDiffResult {
  isExactMatch: boolean;
  matchedModelAnswer: string;
  tokens: DiffToken[];
  correctCount: number;
  wrongCount: number;
  missingCount: number;
  accuracyPercent: number;
}

export interface SpeakingComparisonResult {
  similarityPercent: number;
  keywordRecallPercent: number;
  sequenceSimilarityPercent: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  differentWording: string[];
  diffTokens: DiffToken[];
}

export interface SpeakingAttemptRecord {
  id: string;
  topicId: string;
  topicTitle: string;
  userAnswer: string;
  similarityPercent: number;
  missingKeywords: string[];
  differentWording: string[];
  timestamp: string;
}

/**
 * Deterministic seeded shuffle (Mulberry32) so SSR and initial client render match,
 * and changing the seed re-randomizes question and option order.
 */
export function seededShuffle<T>(array: readonly T[], seed: number): T[] {
  const copy = [...array];
  let state = seed >>> 0;
  const nextRand = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * Normalize apostrophes, quotes, and punctuation for fair comparison.
 */
export function normalizeWord(word: string): string {
  return word
    .replace(/[’‘`]/g, "'")
    .replace(/[“”"]/g, "")
    .replace(/^[.,!?;:()[\]]+|[.,!?;:()[\]]+$/g, "")
    .trim()
    .toLowerCase();
}

export function tokenizeWords(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

/**
 * Compute LCS-based word-level diff between user text and a single target text.
 */
export function computeSingleWordDiff(
  userText: string,
  targetText: string
): WritingDiffResult {
  const userWords = tokenizeWords(userText);
  const targetWords = tokenizeWords(targetText);

  const n = userWords.length;
  const m = targetWords.length;

  // DP table for Longest Common Subsequence
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array(m + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    const uNorm = normalizeWord(userWords[i - 1]);
    for (let j = 1; j <= m; j++) {
      const tNorm = normalizeWord(targetWords[j - 1]);
      if (uNorm === tNorm && uNorm !== "") {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff tokens
  const tokens: DiffToken[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (
      i > 0 &&
      j > 0 &&
      normalizeWord(userWords[i - 1]) === normalizeWord(targetWords[j - 1]) &&
      normalizeWord(userWords[i - 1]) !== ""
    ) {
      tokens.push({ type: "correct", text: targetWords[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tokens.push({ type: "missing", text: targetWords[j - 1] });
      j--;
    } else {
      tokens.push({ type: "wrong", text: userWords[i - 1] });
      i--;
    }
  }

  tokens.reverse();

  const correctCount = tokens.filter((t) => t.type === "correct").length;
  const wrongCount = tokens.filter((t) => t.type === "wrong").length;
  const missingCount = tokens.filter((t) => t.type === "missing").length;

  const isExactMatch =
    m > 0 && correctCount === m && wrongCount === 0 && missingCount === 0;

  const denominator = Math.max(m + wrongCount, 1);
  const accuracyPercent = Math.round((correctCount / denominator) * 100);

  return {
    isExactMatch,
    matchedModelAnswer: targetText,
    tokens,
    correctCount,
    wrongCount,
    missingCount,
    accuracyPercent,
  };
}

/**
 * Compare user's transformed sentence against all accepted model answers
 * and return the best match.
 */
export function evaluateWritingAnswer(
  userText: string,
  acceptedAnswers: string[]
): WritingDiffResult {
  if (!acceptedAnswers.length) {
    return computeSingleWordDiff(userText, "");
  }

  let bestResult = computeSingleWordDiff(userText, acceptedAnswers[0]);
  for (let i = 1; i < acceptedAnswers.length; i++) {
    const candidate = computeSingleWordDiff(userText, acceptedAnswers[i]);
    if (
      candidate.isExactMatch ||
      candidate.accuracyPercent > bestResult.accuracyPercent
    ) {
      bestResult = candidate;
    }
  }
  return bestResult;
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "am",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "to",
  "of",
  "in",
  "on",
  "at",
  "for",
  "from",
  "with",
  "by",
  "about",
  "as",
  "into",
  "and",
  "or",
  "but",
  "so",
  "because",
  "if",
  "when",
  "it",
  "its",
  "i",
  "me",
  "my",
  "we",
  "our",
  "you",
  "your",
  "they",
  "them",
  "their",
  "there",
  "this",
  "that",
  "these",
  "those",
  "very",
  "also",
  "some",
  "many",
  "much",
  "lot",
  "would",
  "like",
  "have",
  "had",
  "has",
  "do",
  "did",
  "not",
  "one",
]);

/**
 * Compare user's speaking response against the topic's model answer.
 */
export function evaluateSpeakingAttempt(
  userText: string,
  modelAnswer: string
): SpeakingComparisonResult {
  const diff = computeSingleWordDiff(userText, modelAnswer);

  const modelWordsRaw = tokenizeWords(modelAnswer);
  const userWordsRaw = tokenizeWords(userText);

  const userNormSet = new Set(
    userWordsRaw.map((w) => normalizeWord(w)).filter(Boolean)
  );
  const modelNormSet = new Set(
    modelWordsRaw.map((w) => normalizeWord(w)).filter(Boolean)
  );

  // Extract unique key content words from the model answer in order of appearance
  const seenKeywords = new Set<string>();
  const modelKeywords: { norm: string; display: string }[] = [];

  for (const w of modelWordsRaw) {
    const norm = normalizeWord(w);
    const cleanDisplay = w.replace(/^[.,!?;:()[\]“”"]|[.,!?;:()[\]“”"]+$/g, "");
    if (norm.length >= 3 && !STOP_WORDS.has(norm) && !seenKeywords.has(norm)) {
      seenKeywords.add(norm);
      modelKeywords.push({ norm, display: cleanDisplay });
    }
  }

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of modelKeywords) {
    if (userNormSet.has(kw.norm)) {
      matchedKeywords.push(kw.display);
    } else {
      missingKeywords.push(kw.display);
    }
  }

  // Identify different wording used by the user (words not present in the model answer)
  const seenDiff = new Set<string>();
  const differentWording: string[] = [];
  for (const w of userWordsRaw) {
    const norm = normalizeWord(w);
    const cleanDisplay = w.replace(/^[.,!?;:()[\]“”"]|[.,!?;:()[\]“”"]+$/g, "");
    if (norm && !modelNormSet.has(norm) && !seenDiff.has(norm)) {
      seenDiff.add(norm);
      differentWording.push(cleanDisplay);
    }
  }

  const keywordRecallPercent =
    modelKeywords.length > 0
      ? Math.round((matchedKeywords.length / modelKeywords.length) * 100)
      : 0;

  const sequenceSimilarityPercent =
    modelWordsRaw.length > 0
      ? Math.round(
          (diff.correctCount /
            Math.max(modelWordsRaw.length, userWordsRaw.length)) *
            100
        )
      : 0;

  // Overall similarity combines sequence overlap (55%) and key vocabulary recall (45%)
  const similarityPercent =
    userWordsRaw.length === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            sequenceSimilarityPercent * 0.55 + keywordRecallPercent * 0.45
          )
        );

  return {
    similarityPercent,
    keywordRecallPercent,
    sequenceSimilarityPercent,
    matchedKeywords,
    missingKeywords,
    differentWording,
    diffTokens: diff.tokens,
  };
}

