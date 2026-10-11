import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "English Review — Writing, Speaking, Grammar, Reading & Listening",
  description:
    "Tổng hợp Ôn tập Tiếng Anh: Writing • Speaking • Grammar • Reading • Listening",
};

const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('english_review_theme');
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
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-[#f8f8f7] font-sans text-neutral-800 antialiased selection:bg-neutral-800 selection:text-white dark:bg-[#0e0e10] dark:text-neutral-100 dark:selection:bg-neutral-200 dark:selection:text-neutral-900">
        {children}
      </body>
    </html>
  );
}
