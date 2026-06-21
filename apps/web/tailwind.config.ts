import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        card: "#0F172A",
        elevated: "#111827",
        border: "#1E293B",
        primary: {
          DEFAULT: "#6366F1",
          foreground: "#F8FAFC",
          hover: "#818CF8",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#F43F5E",
        muted: "#64748B",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        panel: "0 20px 80px rgba(2, 6, 23, 0.45)",
      },
    },
  },
  plugins: [animate],
};

export default config;
