import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // Gulf Gold calibrated palette (21K / 22K warm tones)
        gold: {
          50: "#FCF9EE",
          100: "#F7F0D4",
          200: "#EFE0A7",
          300: "#E6CD76",
          400: "#DDB847",
          500: "#C9A020", // Classic 21K Deep Gold
          600: "#A98214",
          700: "#846311",
          800: "#604712",
          900: "#44320F",
          950: "#241A05",
        },
        sand: {
          50: "#FAF8F5",
          100: "#F3EFEA",
          200: "#E7DFD5",
          300: "#D6C7B7",
          400: "#BFA992",
          500: "#A68D72",
          600: "#8E7358",
          700: "#705B46",
          800: "#5B4A3A",
          900: "#4C3F33",
        },
        majlis: {
          navy: "#0A1128",
          emerald: "#064E3B",
          burgundy: "#4C0519",
          slate: "#0F172A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-plex-arabic)", "sans-serif"],
        arabic: ["var(--font-plex-arabic)", "sans-serif"],
        heading: ["var(--font-jakarta)", "var(--font-plex-arabic)", "sans-serif"],
      },
      boxShadow: {
        luxury: "0 10px 30px -10px rgba(201, 160, 32, 0.25)",
        card: "0 4px 20px -2px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
