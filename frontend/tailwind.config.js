/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'royal-blue': '#1e3a8a',
        'gold': '#fbbf24',
        'gold-light': '#fcd34d',
        'gold-dark': '#d97706',
        'deep-blue': '#172554',
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
