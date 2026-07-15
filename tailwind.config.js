/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#EDEAdf",
        ink: "#2A2E26",
        pine: "#3F5C48",
        moss: "#7C8B6F",
        stamp: "#9C4A32",
        hairline: "#C7C0AE",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sci: ["var(--font-sci)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        grain: "radial-gradient(circle, rgba(42,46,38,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        grain: "3px 3px",
      },
    },
  },
  plugins: [],
};
