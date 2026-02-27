import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Revolut-inspired bright palette
        bg: {
          base: '#FFFFFF',
          surface: '#F7F7FA',
          card: '#FFFFFF',
          elevated: '#F0F0F5',
          dark: '#1B1B2F',
        },
        border: {
          subtle: 'rgba(0, 0, 0, 0.04)',
          DEFAULT: 'rgba(0, 0, 0, 0.08)',
          strong: 'rgba(0, 0, 0, 0.15)',
        },
        primary: {
          DEFAULT: '#6C5CE7',
          light: '#A29BFE',
          dark: '#5341D6',
          muted: 'rgba(108, 92, 231, 0.08)',
          soft: 'rgba(108, 92, 231, 0.12)',
        },
        accent: {
          blue: '#0984E3',
          cyan: '#00CEC9',
          pink: '#FD79A8',
          orange: '#FDCB6E',
          coral: '#FF6B6B',
        },
        success: {
          DEFAULT: '#00B894',
          light: '#55EFC4',
          muted: 'rgba(0, 184, 148, 0.08)',
        },
        warning: {
          DEFAULT: '#FDCB6E',
          muted: 'rgba(253, 203, 110, 0.12)',
        },
        danger: {
          DEFAULT: '#FF6B6B',
          light: '#FF8787',
          muted: 'rgba(255, 107, 107, 0.08)',
        },
        text: {
          primary: '#1A1A2E',
          secondary: '#6B7280',
          muted: '#9CA3AF',
          disabled: '#D1D5DB',
          inverse: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'tab-bar': '5rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'card-glow': 'linear-gradient(135deg, rgba(108,92,231,0.04) 0%, rgba(0,184,148,0.02) 100%)',
        'primary-gradient': 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
        'success-gradient': 'linear-gradient(135deg, #00B894 0%, #55EFC4 100%)',
        'danger-gradient': 'linear-gradient(135deg, #FF6B6B 0%, #FF8787 100%)',
        'hero-gradient': 'linear-gradient(135deg, #6C5CE7 0%, #0984E3 50%, #00CEC9 100%)',
        'warm-gradient': 'linear-gradient(135deg, #FDCB6E 0%, #FD79A8 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-down': 'slideDown 0.25s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        'elevated': '0 4px 16px rgba(0,0,0,0.06)',
        'glow-primary': '0 4px 24px rgba(108, 92, 231, 0.15)',
        'glow-success': '0 4px 24px rgba(0, 184, 148, 0.15)',
        'modal': '0 25px 60px rgba(0,0,0,0.15)',
        'button': '0 2px 8px rgba(108, 92, 231, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
