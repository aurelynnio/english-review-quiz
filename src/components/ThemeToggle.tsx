"use client";

import React, { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";
export type DesignStyle = "atelier" | "botanical" | "kyoto" | "brutalist";

const THEME_STORAGE_KEY = "english_review_theme";
const STYLE_STORAGE_KEY = "english_review_style";

const DESIGN_STYLES: {
  id: DesignStyle;
  label: string;
  swatchPrimary: string;
  swatchSecondary: string;
}[] = [
  {
    id: "atelier",
    label: "Atelier",
    swatchPrimary: "bg-[#b84a27]",
    swatchSecondary: "bg-[#2d6a4f]",
  },
  {
    id: "botanical",
    label: "Botanical",
    swatchPrimary: "bg-[#1f5c44]",
    swatchSecondary: "bg-[#b47b28]",
  },
  {
    id: "kyoto",
    label: "Kyoto Ink",
    swatchPrimary: "bg-[#25416b]",
    swatchSecondary: "bg-[#c84b31]",
  },
  {
    id: "brutalist",
    label: "Neo-Brutal",
    swatchPrimary: "bg-[#1e1d1b] dark:bg-[#e09f3e]",
    swatchSecondary: "bg-[#2b4c7e]",
  },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [style, setStyle] = useState<DesignStyle>("atelier");
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

      const savedStyle = window.localStorage.getItem(
        STYLE_STORAGE_KEY
      ) as DesignStyle | null;
      if (
        savedStyle &&
        ["atelier", "botanical", "kyoto", "brutalist"].includes(savedStyle)
      ) {
        setStyle(savedStyle);
        document.documentElement.setAttribute("data-style", savedStyle);
      } else {
        document.documentElement.setAttribute("data-style", "atelier");
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

  const applyStyle = (nextStyle: DesignStyle) => {
    setStyle(nextStyle);
    document.documentElement.setAttribute("data-style", nextStyle);
    try {
      window.localStorage.setItem(STYLE_STORAGE_KEY, nextStyle);
    } catch {
      // Ignore storage write errors
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Studio Design Style Picker */}
      <div
        role="group"
        aria-label="Design style selection"
        className="studio-subcard inline-flex items-center gap-1 rounded-xl border p-1"
      >
        {DESIGN_STYLES.map((item) => {
          const isActive = mounted && style === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => applyStyle(item.id)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "studio-card font-semibold text-stone-900 dark:text-stone-100"
                  : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              <span className="inline-flex items-center -space-x-1">
                <span
                  className={`h-2.5 w-2.5 rounded-full ring-1 ring-white/80 dark:ring-black/60 ${item.swatchPrimary}`}
                />
                <span
                  className={`h-2.5 w-2.5 rounded-full ring-1 ring-white/80 dark:ring-black/60 ${item.swatchSecondary}`}
                />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Light / Dark Mode Switch */}
      <div
        role="group"
        aria-label="Color mode selection"
        className="studio-subcard inline-flex items-center rounded-xl border p-1"
      >
        <button
          type="button"
          onClick={() => applyTheme("light")}
          aria-pressed={mounted && theme === "light"}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            mounted && theme === "light"
              ? "studio-card font-semibold text-stone-900 dark:text-stone-100"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          }`}
        >
          Light
        </button>
        <button
          type="button"
          onClick={() => applyTheme("dark")}
          aria-pressed={mounted && theme === "dark"}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            mounted && theme === "dark"
              ? "studio-card font-semibold text-stone-900 dark:text-stone-100"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          }`}
        >
          Dark
        </button>
      </div>
    </div>
  );
}
