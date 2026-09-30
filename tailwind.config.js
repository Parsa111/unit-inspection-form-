/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        navy: {
          50:  '#f0f5fc',
          100: '#e1ecf8',
          200: '#c5daf2',
          300: '#9bbfe8',
          400: '#689ddb',
          500: '#437dcb',
          600: '#1e3a5f',
          700: '#172d4a',
          800: '#0f1e33',
          900: '#0a1424',
          950: '#060b14',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.12)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.3)',
      }
    },
  },
  plugins: [],
}
