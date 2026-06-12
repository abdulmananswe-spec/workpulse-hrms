/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          900: "#312E81",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F4F6FB",
          card: "rgba(255,255,255,0.82)",
        },
      },
      boxShadow: {
        premium: "0 18px 48px rgba(15, 23, 42, 0.08)",
        glow: "0 12px 36px rgba(79, 70, 229, 0.18)",
        float: "0 24px 60px rgba(15, 23, 42, 0.12)",
      },
      letterSpacing: {
        premium: "0.02em",
      },
    },
  },
  plugins: [],
};
