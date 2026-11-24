/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "var(--font-jetbrains-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        ink: {
          950: "#0b1220",
          900: "#0f172a",
          700: "#334155",
          600: "#475569",
        },
        surface: {
          DEFAULT: "#ffffff",
          50: "#fafafa",
          100: "#f5f5f4",
          200: "#e2e8f0",
          /* Compatibilité tokens existants basculés vers le thème clair */
          950: "#ffffff",
          900: "#fafafa",
          850: "#f5f5f4",
          800: "#f1f5f9",
          700: "#e2e8f0",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.06)",
        popover: "0 4px 12px rgba(15, 23, 42, 0.08), 0 16px 36px rgba(15, 23, 42, 0.10)",
      },
    },
  },
  plugins: [],
};
