export function getLevelBadgeClass(level: number): string {
  switch (level) {
    case 1:
      // Sage / Jade Green for Level 1
      return "border-[#b7d3c4] bg-[#e6f2ec] text-[#184e38] dark:border-[#285440] dark:bg-[#12291f] dark:text-[#86d9b3]";
    case 2:
      // Indigo / Navy for Level 2
      return "border-[#bccce3] bg-[#eaeff7] text-[#1d3961] dark:border-[#2c4469] dark:bg-[#132033] dark:text-[#98bae8]";
    case 3:
      // Terracotta / Carmine for Level 3
      return "border-[#e2bfb0] bg-[#faece6] text-[#8f3416] dark:border-[#6e3422] dark:bg-[#331911] dark:text-[#f3a68c]";
    default:
      return "border-stone-300 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300";
  }
}

export function getLevelDotClass(level: number): string {
  switch (level) {
    case 1:
      return "bg-[#1f5c44] dark:bg-[#52b788]";
    case 2:
      return "bg-[#25416b] dark:bg-[#7ca5de]";
    case 3:
      return "bg-[#b84a27] dark:bg-[#e07a5f]";
    default:
      return "bg-stone-500";
  }
}

export function getStatusBadgeClass(status: "unlearned" | "learning" | "mastered"): string {
  switch (status) {
    case "mastered":
      return "border-[#a3d9bc] bg-[#e8f6ef] text-[#185e3a] dark:border-[#23583c] dark:bg-[#0e271a] dark:text-[#7ae4ab]";
    case "learning":
      return "border-[#ebd79b] bg-[#fbf5e2] text-[#855708] dark:border-[#634915] dark:bg-[#2b1f07] dark:text-[#f2c96c]";
    case "unlearned":
    default:
      return "border-[#ded3c3] bg-[#f3ede3] text-[#6d6153] dark:border-[#3a322b] dark:bg-[#1f1a16] dark:text-[#a89b8d]";
  }
}
