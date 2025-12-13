/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}",
    "./types.ts"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF0033',
          hover: '#D9002B',
          dark: '#CC002A',
        },
        dark: {
          bg: '#121212',
          surface: '#1E1E1E',
          border: '#333333',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"SF Pro Display"', '"SF Pro Text"', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
