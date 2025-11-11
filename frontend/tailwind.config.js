/**
 * ============================================
 * FlagForge - Tailwind CSS Configuration
 * ============================================
 * Cyberpunk/Neon Dark Theme
 *
 * Color Palette:
 * - Cyan/Electric Blue: #00ffea (primary glow)
 * - Magenta/Pink: #ff006e (secondary glow)
 * - Dark Background: #0d0d12 (main bg)
 * - Darker: #080808 (cards/panels)
 * - Purple: #8b5cf6 (accents)
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk color palette
        neon: {
          cyan: '#00ffea',
          magenta: '#ff006e',
          purple: '#8b5cf6',
          green: '#39ff14',
          blue: '#0ff',
        },
        dark: {
          bg: '#0d0d12',
          card: '#1a1a24',
          hover: '#2a2a3a',
          border: '#2d2d3d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 255, 234, 0.5), 0 0 40px rgba(0, 255, 234, 0.3)',
        'neon-magenta': '0 0 20px rgba(255, 0, 110, 0.5), 0 0 40px rgba(255, 0, 110, 0.3)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 255, 234, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 255, 234, 0.5)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(0, 255, 234, 0.8), 0 0 60px rgba(0, 255, 234, 0.6)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
