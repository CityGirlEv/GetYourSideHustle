/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        cinzel: ['Cinzel', 'serif'],
      },
      colors: {
        earth: {
          cream: '#FAF8F5',
          sand: '#F3EFE6',
          sandstone: '#E8E1D5',
          card: '#FFFFFF',
          espresso: '#1F1917',
          charcoal: '#2D2623',
          terracotta: '#C2410C',
          'terracotta-hover': '#9A3412',
          'terracotta-soft': '#FFEDD5',
          sage: '#047857',
          'sage-soft': '#D1FAE5',
          amber: '#D97706',
          'amber-soft': '#FEF3C7',
          taupe: '#E5DFD3',
          muted: '#3F3832',
        },
      },
    },
  },
  plugins: [],
};
