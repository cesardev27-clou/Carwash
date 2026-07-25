import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta "Acero & Petróleo"
        canvas: "#EDEFF1",
        surface: "#FFFFFF",
        ink: "#1D2733",
        muted: "#6B7683",
        hairline: "#DCE1E6",
        primary: {
          DEFAULT: "#2E3B55", // índigo acero
          hover: "#26314699",
        },
        accent: {
          DEFAULT: "#2F7C79", // petróleo
          hover: "#296e6b",
        },
        // semánticos apagados, solo feedback puntual
        success: "#3F7A5B",
        danger: "#A6483F",
        warn: "#9A6B2E",
      },
      borderRadius: {
        xl: "0.875rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(29,39,51,0.04), 0 1px 3px rgba(29,39,51,0.06)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
