import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          950: "#07070a",
          900: "#0d1118",
          800: "#141c28"
        },
        gold: {
          100: "#fbf3cc",
          300: "#f6d767",
          500: "#d7a327",
          700: "#8a5a05"
        }
      },
      boxShadow: {
        glow: "0 0 40px rgba(246, 215, 103, 0.25)",
        panel: "0 24px 80px rgba(0, 0, 0, 0.35)"
      },
      animation: {
        drift: "drift 18s linear infinite",
        float: "float 6s ease-in-out infinite",
        pulseGold: "pulseGold 3s ease-in-out infinite",
        spinSlow: "spin 20s linear infinite"
      },
      keyframes: {
        drift: {
          "0%": { transform: "translateX(-10%) translateY(0)" },
          "50%": { transform: "translateX(8%) translateY(-6%)" },
          "100%": { transform: "translateX(-10%) translateY(0)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(246, 215, 103, 0.15)" },
          "50%": { boxShadow: "0 0 32px rgba(246, 215, 103, 0.35)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
