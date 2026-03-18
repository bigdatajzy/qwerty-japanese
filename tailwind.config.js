/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
        },
        accent: '#8b5cf6',
        success: '#22c55e',
        error: '#ef4444',
        dark: {
          bg: '#1a1a2e',
          card: '#2d2d44',
        },
      },
      fontFamily: {
        mono: ['Roboto Mono', 'monospace'],
        jp: ['Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
