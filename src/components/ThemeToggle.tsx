"use client";

import React, { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "english_review_theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = window.localStorage.getItem(
        THEME_STORAGE_KEY
      ) as ThemeMode | null;
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
        document.documentElement.classList.toggle("dark", saved === "dark");
      } else {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        const initial: ThemeMode = prefersDark ? "dark" : "light";
        setTheme(initial);
        document.documentElement.classList.toggle("dark", initial === "dark");
      }
    } catch {
      // Fallback if localStorage is unavailable
    }
  }, []);

  const applyTheme = (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Ignore storage write errors
    }
  };

  return (
    <div
      role="group"
      aria-label="Theme selection"
      className="inline-flex items-center rounded-xl border border-neutral-200/90 bg-neutral-100/80 p-1 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <button
        type="button"
        onClick={() => applyTheme("light")}
        aria-pressed={mounted && theme === "light"}
        className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
          mounted && theme === "light"
            ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-100"
            : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
        }`}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => applyTheme("dark")}
        aria-pressed={mounted && theme === "dark"}
        className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
          mounted && theme === "dark"
            ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-100"
            : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
        }`}
      >
        Dark
      </button>
    </div>
  );
}
