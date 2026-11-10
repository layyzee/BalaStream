/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stremio: {
          bg: '#0a0b10',
          card: '#121520',
          cardHover: '#191e2e',
          border: 'rgba(255, 255, 255, 0.08)',
          purple: '#7b3fe4',
          purpleHover: '#8f56ef',
          accent: '#9d5cff'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'Menlo', 'Monaco', 'monospace']
      }
    },
  },
  plugins: [],
}
