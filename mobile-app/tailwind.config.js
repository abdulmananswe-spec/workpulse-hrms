/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#312e81",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f8fafc",
          card: "rgba(255,255,255,0.82)",
        },
      },
      boxShadow: {
        premium: "0 12px 40px rgba(15, 23, 42, 0.08)",
        glow: "0 8px 32px rgba(79, 70, 229, 0.18)",
      },
    },
  },
  plugins: [],
};
