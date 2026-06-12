/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F766E', // Deep Teal
          light: '#115E59',
          dark: '#134E4A',
        },
        secondary: {
          DEFAULT: '#14B8A6', // Aqua Green
          light: '#2DD4BF',
          dark: '#0D9488',
        },
        accent: {
          DEFAULT: '#22C55E', // Fresh Green
          light: '#4ADE80',
          dark: '#15803D',
        },
        background: '#F8FAFC', // Light Gray
        surface: '#FFFFFF',    // White
        heading: '#0F172A',    // Dark Slate
        body: '#475569',       // Slate Gray
        muted: '#64748B',      // Muted Slate
        border: '#E2E8F0',     // Light Border
        success: '#10B981',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 118, 110, 0.05)',
        'soft-lg': '0 10px 30px -5px rgba(15, 118, 110, 0.08)',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
}
