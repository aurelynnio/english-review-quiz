import { HskWord, HSK_WORDS } from "@/data/hskWords";

export type MasteryStatus = "unlearned" | "learning" | "mastered";

export interface WordProgress {
  id: number;
  status: MasteryStatus;
  starred: boolean;
  repetitions: number; // Leitner / SRS stage: 0 to 5+
  nextReviewDate: number; // timestamp in ms (0 if unlearned)
  lastReviewedDate?: number;
  mistakeCount: number;
  lastMistakeDate?: number;
  notes?: string;
}

export interface UserStudyData {
  words: Record<number, WordProgress>;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalReviewsCompleted: number;
}

const STORAGE_KEY = "hsk30_user_study_data_v1";

// Spaced Repetition intervals in milliseconds
const SRS_INTERVALS_MS = [
  1 * 24 * 60 * 60 * 1000,  // Level 1: 1 day
  2 * 24 * 60 * 60 * 1000,  // Level 2: 2 days
  4 * 24 * 60 * 60 * 1000,  // Level 3: 4 days
  7 * 24 * 60 * 60 * 1000,  // Level 4: 7 days
  15 * 24 * 60 * 60 * 1000, // Level 5: 15 days
  30 * 24 * 60 * 60 * 1000, // Level 6+: 30 days
];

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultStudyData(): UserStudyData {
  return {
    words: {},
    streakDays: 1,
    lastActiveDate: getTodayDateString(),
    totalReviewsCompleted: 0,
  };
}

export function loadStudyData(): UserStudyData {
  if (typeof window === "undefined") {
    return getDefaultStudyData();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultStudyData();
    const data = JSON.parse(raw) as UserStudyData;
    if (!data.words) data.words = {};

    // Calculate streak
    const today = getTodayDateString();
    if (data.lastActiveDate !== today) {
      const last = new Date(data.lastActiveDate).getTime();
      const curr = new Date(today).getTime();
      const diffDays = Math.round((curr - last) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        data.streakDays = (data.streakDays || 0) + 1;
      } else if (diffDays > 1) {
        data.streakDays = 1;
      }
      data.lastActiveDate = today;
      saveStudyData(data);
    }

    return data;
  } catch (err) {
    console.error("Failed to load study data:", err);
    return getDefaultStudyData();
  }
}

export function saveStudyData(data: UserStudyData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save study data:", err);
  }
}

export function getWordProgress(
  data: UserStudyData,
  wordId: number
): WordProgress {
  return (
    data.words[wordId] || {
      id: wordId,
      status: "unlearned",
      starred: false,
      repetitions: 0,
      nextReviewDate: 0,
      mistakeCount: 0,
    }
  );
}

export function updateWordRecall(
  data: UserStudyData,
  wordId: number,
  outcome: "again" | "hard" | "good"
): UserStudyData {
  const current = getWordProgress(data, wordId);
  const now = Date.now();
  let nextRep = current.repetitions;
  let nextStatus: MasteryStatus = current.status;
  let nextReviewDate = now;
  let mistakeCount = current.mistakeCount;
  let lastMistakeDate = current.lastMistakeDate;

  if (outcome === "again") {
    nextRep = 0;
    nextStatus = "learning";
    mistakeCount += 1;
    lastMistakeDate = now;
    // Due again today in 10 minutes
    nextReviewDate = now + 10 * 60 * 1000;
  } else if (outcome === "hard") {
    nextRep = Math.max(1, nextRep);
    nextStatus = "learning";
    // 1 day later
    nextReviewDate = now + 24 * 60 * 60 * 1000;
  } else if (outcome === "good") {
    nextRep += 1;
    if (nextRep >= 4) {
      nextStatus = "mastered";
    } else {
      nextStatus = "learning";
    }
    const intervalIdx = Math.min(nextRep - 1, SRS_INTERVALS_MS.length - 1);
    nextReviewDate = now + (SRS_INTERVALS_MS[intervalIdx] || 24 * 60 * 60 * 1000);
  }

  const updatedProgress: WordProgress = {
    ...current,
    status: nextStatus,
    repetitions: nextRep,
    nextReviewDate,
    lastReviewedDate: now,
    mistakeCount,
    lastMistakeDate,
  };

  const nextData: UserStudyData = {
    ...data,
    totalReviewsCompleted: (data.totalReviewsCompleted || 0) + 1,
    words: {
      ...data.words,
      [wordId]: updatedProgress,
    },
  };

  saveStudyData(nextData);
  return nextData;
}

export function toggleWordStar(
  data: UserStudyData,
  wordId: number
): UserStudyData {
  const current = getWordProgress(data, wordId);
  const updatedProgress: WordProgress = {
    ...current,
    starred: !current.starred,
  };
  const nextData: UserStudyData = {
    ...data,
    words: {
      ...data.words,
      [wordId]: updatedProgress,
    },
  };
  saveStudyData(nextData);
  return nextData;
}

export function setWordStatus(
  data: UserStudyData,
  wordId: number,
  status: MasteryStatus
): UserStudyData {
  const current = getWordProgress(data, wordId);
  const now = Date.now();
  const updatedProgress: WordProgress = {
    ...current,
    status,
    repetitions: status === "mastered" ? Math.max(4, current.repetitions) : current.repetitions,
    lastReviewedDate: now,
    nextReviewDate:
      status === "mastered"
        ? now + 30 * 24 * 60 * 60 * 1000
        : status === "learning"
        ? now + 24 * 60 * 60 * 1000
        : 0,
  };
  const nextData: UserStudyData = {
    ...data,
    words: {
      ...data.words,
      [wordId]: updatedProgress,
    },
  };
  saveStudyData(nextData);
  return nextData;
}

export function clearMistakeRecord(
  data: UserStudyData,
  wordId: number
): UserStudyData {
  const current = getWordProgress(data, wordId);
  const updatedProgress: WordProgress = {
    ...current,
    mistakeCount: 0,
  };
  const nextData: UserStudyData = {
    ...data,
    words: {
      ...data.words,
      [wordId]: updatedProgress,
    },
  };
  saveStudyData(nextData);
  return nextData;
}

export function isWordDueForReview(progress: WordProgress): boolean {
  if (progress.status === "unlearned" || !progress.nextReviewDate) return false;
  return Date.now() >= progress.nextReviewDate;
}

export function playChineseAudio(text: string, rate: number = 0.9): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = rate;

      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().includes("zh-cn") ||
          v.lang.toLowerCase().includes("zh") ||
          v.name.includes("Chinese") ||
          v.name.includes("Mandarin")
      );
      if (zhVoice) {
        utterance.voice = zhVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    } catch {
      resolve();
    }
  });
}

export function shuffleArray<T>(array: readonly T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

export interface QuizQuestion {
  id: string;
  word: HskWord;
  type: "hanzi-to-meaning" | "meaning-to-hanzi" | "hanzi-to-pinyin" | "listening-to-hanzi";
  prompt: string;
  subPrompt?: string;
  audioText?: string;
  options: {
    id: string;
    text: string;
    subText?: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

export function generateQuiz(
  targetWords: HskWord[],
  allWords: HskWord[],
  count: number = 10,
  questionType?: QuizQuestion["type"]
): QuizQuestion[] {
  if (targetWords.length === 0) return [];
  const selected = shuffleArray(targetWords).slice(0, count);

  return selected.map((word, idx) => {
    // Choose question type
    const types: QuizQuestion["type"][] = [
      "hanzi-to-meaning",
      "meaning-to-hanzi",
      "hanzi-to-pinyin",
      "listening-to-hanzi",
    ];
    const type = questionType || types[idx % types.length];

    // Pick 3 distractors from same level if possible
    const sameLevelWords = allWords.filter(
      (w) => w.id !== word.id && w.level === word.level
    );
    const candidatePool = sameLevelWords.length >= 3 ? sameLevelWords : allWords.filter((w) => w.id !== word.id);
    const distractors = shuffleArray(candidatePool).slice(0, 3);

    let prompt = "";
    let subPrompt = "";
    let audioText = "";
    let options: QuizQuestion["options"] = [];

    if (type === "hanzi-to-meaning") {
      prompt = word.word;
      subPrompt = `${word.pinyin} • Âm Hán-Việt: ${word.hanviet}`;
      audioText = word.word;
      const opts = [
        { id: `opt-${word.id}`, text: word.meaningVi, subText: word.pos, isCorrect: true },
        ...distractors.map((d) => ({
          id: `opt-${d.id}`,
          text: d.meaningVi,
          subText: d.pos,
          isCorrect: false,
        })),
      ];
      options = shuffleArray(opts);
    } else if (type === "meaning-to-hanzi") {
      prompt = word.meaningVi;
      subPrompt = `[${word.pos}] • Pinyin: ${word.pinyin}`;
      audioText = word.word;
      const opts = [
        { id: `opt-${word.id}`, text: word.word, subText: word.hanviet, isCorrect: true },
        ...distractors.map((d) => ({
          id: `opt-${d.id}`,
          text: d.word,
          subText: d.hanviet,
          isCorrect: false,
        })),
      ];
      options = shuffleArray(opts);
    } else if (type === "hanzi-to-pinyin") {
      prompt = word.word;
      subPrompt = `Nghĩa: ${word.meaningVi}`;
      audioText = word.word;
      const opts = [
        { id: `opt-${word.id}`, text: word.pinyin, subText: word.meaningVi, isCorrect: true },
        ...distractors.map((d) => ({
          id: `opt-${d.id}`,
          text: d.pinyin,
          subText: d.meaningVi,
          isCorrect: false,
        })),
      ];
      options = shuffleArray(opts);
    } else {
      // listening-to-hanzi
      prompt = "🔊 Nhấn nghe và chọn chữ Hán đúng";
      subPrompt = `Gợi ý: ${word.meaningVi}`;
      audioText = word.word;
      const opts = [
        { id: `opt-${word.id}`, text: word.word, subText: word.pinyin, isCorrect: true },
        ...distractors.map((d) => ({
          id: `opt-${d.id}`,
          text: d.word,
          subText: d.pinyin,
          isCorrect: false,
        })),
      ];
      options = shuffleArray(opts);
    }

    return {
      id: `q-${word.id}-${idx}`,
      word,
      type,
      prompt,
      subPrompt,
      audioText,
      options,
      explanation: `${word.word} [${word.pinyin}] — Âm Hán-Việt: "${word.hanviet}" • Nghĩa: "${word.meaningVi}" (${word.pos}) • Tiếng Anh: ${word.meaningEn}`,
    };
  });
}

