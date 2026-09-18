/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F9F6F0",
        "cream-2": "#F1EAE0",
        "soft-yellow": "#F4C542",
        "deep-brown": "#3C2A21",
        mocha: "#7C5C4A",
        "light-brown": "#D5B4B4",
      },
      fontFamily: {
        sans: [
          "DM Sans Variable",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        display: ["Fraunces Variable", "Georgia", "Times New Roman", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      fontSize: {
        "timer": "clamp(2.75rem, 13vw, 4.5rem)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(60,42,33,0.06), 0 4px 12px rgba(60,42,33,0.05)",
        lift: "0 2px 4px rgba(60,42,33,0.08), 0 12px 28px rgba(60,42,33,0.10)",
      },
      transitionTimingFunction: {
        brew: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
