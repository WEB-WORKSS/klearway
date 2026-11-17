/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0F1D1C', 800: '#16292A', 700: '#203837', 600: '#35504E', 400: '#566A67', 300: '#9AABA8' },
        paper: { DEFAULT: '#F5F1E8', 50: '#FBF9F4', 200: '#ECE6D8', 300: '#DDD4C0' },
        signal: { DEFAULT: '#E9A23B', 600: '#C9831F', 700: '#8A5A12', 100: '#FBEBD0' },
        tide: { DEFAULT: '#1E6B5A', 600: '#17564A', 100: '#D6EBE3' },
        flag: { DEFAULT: '#B8402A', 100: '#F6DDD6' },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        sheet: '0 1px 0 rgba(15,29,28,0.04), 0 8px 24px -12px rgba(15,29,28,0.18)',
        lift: '0 24px 48px -24px rgba(15,29,28,0.35)',
      },
      maxWidth: { page: '76rem' },
    },
  },
  plugins: [],
};
