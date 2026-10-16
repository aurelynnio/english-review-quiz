import type { Metadata } from "next";
import {
  Fraunces,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HSK 3.0 词汇宝典 — 查词 • 背单词 • 智能复习 (HSK 1 - 3)",
  description:
    "1000 Từ vựng HSK 3.0 cốt lõi (Cấp 1, 2, 3): Tra từ điển đa năng, Học từ mới qua Flashcard & Quiz, Ôn tập ngắt quãng Spaced Repetition (SRS) & Sổ tay từ khó.",
};

const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('hsk_app_theme_mode');
    var isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${fraunces.variable} ${jakarta.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen font-sans antialiased selection:bg-[#b84a27]/20 selection:text-[#b84a27]">
        {children}
      </body>
    </html>
  );
}
