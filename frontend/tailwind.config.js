/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        rappi: {
          orange: '#FF441F',
          darkOrange: '#E03310',
          lightOrange: '#FF6B4E',
        }
      }
    },
  },
  plugins: [],
}
