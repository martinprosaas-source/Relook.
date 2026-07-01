/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'noir-atelier':   '#15140F',
        'carte-grise':    '#ECE6D6',
        'jaune-securite': '#F5C518',
        'bleu-grise':     '#2F4C6B',
        'acier':          '#3A3830',
        'texte-muted':    '#9C9788',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },
      keyframes: {
        fadeSlideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      height: {
        'screen-dvh': '100dvh',
      },
      minHeight: {
        'screen-dvh': '100dvh',
      },
      padding: {
        'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
        'safe-top':    'env(safe-area-inset-top)',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}
