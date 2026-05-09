/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#050505',
          neon: '#00ff9d',
          accent: '#ff0055',
          panel: '#111111',
          border: '#333333'
        }
      },
      fontFamily: {
        mono: ['"Fira Code"', 'monospace']
      }
    },
  },
  plugins: [],
}
