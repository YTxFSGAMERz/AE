// Motion kit design system (Apple-inspired) — shared by every template.
// Accent can be switched per render without editing code:
//   REMOTION_ACCENT=#2563EB REMOTION_ACCENT_DEEP=#1D4ED8 REMOTION_ACCENT_DARK=#60A5FA npx remotion render ...
const env = (k: string, d: string) => (typeof process !== "undefined" && process.env && process.env[k]) || d;
export const theme = {
  paper: "#FBFBFD", // Apple off-white — never pure #fff
  ink: "#030712",
  inkSoft: "#6E6E73",
  hairline: "rgba(0,0,0,0.08)",
  accent: env("REMOTION_ACCENT", "#7C3AED"),
  accentDeep: env("REMOTION_ACCENT_DEEP", "#6D28D9"),
  accentOnDark: env("REMOTION_ACCENT_DARK", "#A78BFA"), // lighter tint for dark-mode takeovers
  danger: "#ef4444",
  fontDisplay: "SF Pro Display",
  fontText: "SF Pro Text",
} as const;

export const accentTint = (a: number) => {
  const h = theme.accent.replace("#", ""); const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const APPLE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
