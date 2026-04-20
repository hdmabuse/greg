/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0d1117',
        surface: '#161b22',
        border: '#30363d',
        primary: '#58a6ff',
        success: '#3fb950',
        error: '#f85149',
        text: '#e6edf3',
        'text-muted': '#8b949e',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}