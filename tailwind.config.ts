import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        graphite: "#05070d",
        obsidian: "#090d14",
        floodlight: "#d8fff2",
        neon: "#35ff9b",
        cyanline: "#20c7ff",
        warning: "#ffcf5c",
        danger: "#ff3e6c"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-space)", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(53, 255, 155, 0.22)",
        blueglow: "0 0 46px rgba(32, 199, 255, 0.24)",
        stadium: "0 24px 90px rgba(0, 0, 0, 0.56)"
      },
      backgroundImage: {
        "stadium-radial": "radial-gradient(circle at 50% 18%, rgba(32,199,255,0.20), transparent 38%), radial-gradient(circle at 78% 24%, rgba(53,255,155,0.12), transparent 28%), linear-gradient(180deg, #07111e 0%, #05070d 58%, #020305 100%)"
      },
      keyframes: {
        sweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.45", filter: "blur(0px)" },
          "50%": { opacity: "1", filter: "blur(1px)" }
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      },
      animation: {
        sweep: "sweep 12s linear infinite",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        ticker: "ticker 28s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
