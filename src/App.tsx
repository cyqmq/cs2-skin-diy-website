import { useState } from "react";
import { gradientStyle, type GradientTheme } from "./gradients";

const themes: GradientTheme[] = [
  "pink", "rose", "pinkBlush", "pinkDeep", "pinkBerry", "pinkPeach", "pinkHot",
  "coral", "peach", "sunset", "amber", "gold",
  "sky", "ocean", "teal", "mint", "emerald", "lime", "cyan",
  "violet", "lavender", "indigo", "grape", "cherry", "slate",
];

export default function App() {
  const [theme, setTheme] = useState<GradientTheme>("pink");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: gradientStyle(theme),
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        paddingBottom: 30,
      }}
    >
      <div style={{
        display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center",
        maxWidth: "95vw", background: "rgba(0,0,0,0.3)", padding: "10px 16px",
        borderRadius: 8
      }}>
        {themes.map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            style={{
              padding: "5px 14px", fontSize: 12, fontFamily: "monospace",
              border: t === theme ? "2px solid #fff" : "1px solid #888",
              borderRadius: 4, cursor: "pointer",
              background: t === theme ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.4)",
              color: "white",
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
