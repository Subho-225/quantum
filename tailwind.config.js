/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        surface: '#151C2C',
        surfaceHighlight: '#1E293B',
        neonBlue: '#00F0FF',
        neonPurple: '#B100FF',
        textMain: '#E2E8F0',
        textMuted: '#94A3B8'
      }
    },
  },
  plugins: [],
}
