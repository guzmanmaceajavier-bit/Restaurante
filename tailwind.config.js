/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brick: {
          50: '#fdf2ef',
          100: '#fae2d8',
          400: '#d97a60',
          500: '#c8553d',
          600: '#a8432f',
          700: '#8a3827',
        },
        warm: '#f5f5f0',
        ink: '#1a1a1a',
        steel: '#6b6b6b',
        smoke: '#e5e5e0',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        lift: '0 8px 30px rgba(0,0,0,0.08)',
      },
      maxWidth: {
        content: '1280px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
