export type GradientTheme =
  | "pink"
  | "rose"
  | "sky"
  | "ocean"
  | "mint"
  | "violet"
  | "sunset"
  | "lime"
  | "coral"
  | "slate"
  | "gold"
  | "lavender"
  | "pinkBlush"
  | "pinkDeep"
  | "pinkBerry"
  | "pinkPeach"
  | "pinkHot"
  | "peach"
  | "teal"
  | "indigo"
  | "amber"
  | "emerald"
  | "cyan"
  | "grape"
  | "cherry";

const gradients: Record<GradientTheme, string> = {
  pink: "linear-gradient(to top right, #fce4ec, #f8bbd0, #f48fb1)",
  rose: "linear-gradient(to right top, #fce4ec, #f3a4b5, #e27396)",
  sky: "linear-gradient(to top right, #dbeafe, #93c5fd, #60a5fa)",
  ocean: "linear-gradient(to right top, #ccfbf1, #5eead4, #0d9488)",
  mint: "linear-gradient(to top right, #d1fae5, #6ee7b7, #34d399)",
  violet: "linear-gradient(to right top, #ede9fe, #c4b5fd, #8b5cf6)",
  sunset: "linear-gradient(to top right, #ffedd5, #fdba74, #f97316)",
  lime: "linear-gradient(to right top, #ecfccb, #bef264, #a3e635)",
  coral: "linear-gradient(to top right, #fef2f2, #fda4af, #fb7185)",
  slate: "linear-gradient(to right top, #f1f5f9, #94a3b8, #475569)",
  gold: "linear-gradient(to top right, #fefce8, #fde047, #eab308)",
  lavender: "linear-gradient(to right top, #f3e8ff, #d8b4fe, #a855f7)",
  pinkBlush: "linear-gradient(to top right, #fdf2f4, #f9c8d4, #ec7d9a)",
  pinkDeep: "linear-gradient(to right top, #fce4ec, #e8a0ba, #c94b7a)",
  pinkBerry: "linear-gradient(to top right, #fce8f0, #e4a0bf, #b4527d)",
  pinkPeach: "linear-gradient(to right top, #fef3f4, #f5c4cd, #df869e)",
  pinkHot: "linear-gradient(to top right, #fce4ec, #f0a0c0, #e04b8a)",
  peach: "linear-gradient(to top right, #fff1f0, #fbc3b6, #f28b82)",
  teal: "linear-gradient(to right top, #e0f2f1, #80cbc4, #009688)",
  indigo: "linear-gradient(to top right, #e8eaf6, #9fa8da, #5c6bc0)",
  amber: "linear-gradient(to right top, #fff8e1, #ffd54f, #ff8f00)",
  emerald: "linear-gradient(to top right, #e8f5e9, #81c784, #388e3c)",
  cyan: "linear-gradient(to right top, #e0f7fa, #4dd0e1, #00acc1)",
  grape: "linear-gradient(to top right, #f3e5f5, #ce93d8, #9c27b0)",
  cherry: "linear-gradient(to right top, #fce4ec, #ef5350, #c62828)",
};

export function gradientStyle(theme: GradientTheme): string {
  return gradients[theme];
}

