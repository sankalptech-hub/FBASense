/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#1E1B4B",
        background: "#F8F9FA",
        foreground: "#0F172A",
        primary: {
          DEFAULT: "#1E1B4B",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F1F5F9",
          foreground: "#0F172A",
        },
        accent: {
          DEFAULT: "#F97316",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ['Public Sans', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
