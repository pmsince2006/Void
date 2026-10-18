/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          deep: '#0B0B0B',
          black: '#111111',
          charcoal: '#202020',
          surface: '#181818',
          ivory: '#F0F0ED',
          palegrey: '#D1D3D2',
          stone: '#D6D1C8',
          grey: '#777777',
          mediumgrey: '#777777',
          muted: '#8E8A82',
          border: '#282828',
          borderLight: '#DCD7CE',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        widest: '0.18em',
        ultra: '0.28em',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'marquee': 'marquee 22s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}


