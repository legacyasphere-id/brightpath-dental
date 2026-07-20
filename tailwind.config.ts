import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clinic: {
          bg: "#FAFAF8", // warm off-white — page background
          surface: "#FFFFFF", // cards and panels
          navy: "#1B4F72", // primary brand — nav, buttons, headings
          navyDark: "#154360", // hover states
          teal: "#2E7D8C", // secondary accent — avatars, non-mint highlights
          mint: "#2ECC71", // accent — chat widget, badges, highlights
          mintLight: "#F0FAF5", // AI chat background, light sections
          text: "#1A1A2E", // near-black — all headings
          body: "#4A5568", // body copy
          muted: "#718096", // captions, metadata
          border: "#E8EDF2", // dividers, card borders
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "var(--font-inter)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"], // for labels, tags
      },
    },
  },
};

export default config;
