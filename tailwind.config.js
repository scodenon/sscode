/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.25rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '2rem',
      },
    },
    extend: {
      boxShadow: {
        soft: '0 1px 0 rgba(255,255,255,0.06), 0 16px 40px rgba(0,0,0,0.35)',
        lift: '0 1px 0 rgba(255,255,255,0.08), 0 22px 60px rgba(0,0,0,0.45)',
      },
      backgroundImage: {
        'app-radial':
          'radial-gradient(1200px 600px at 20% 10%, rgba(59,130,246,0.18), rgba(0,0,0,0)), radial-gradient(900px 520px at 85% 20%, rgba(168,85,247,0.12), rgba(0,0,0,0))',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0.98)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 180ms ease-out',
        'scale-in': 'scale-in 160ms ease-out',
      },
    },
  },
  plugins: [],
};
