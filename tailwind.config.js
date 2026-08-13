/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff7ff',
          100: '#daedff',
          200: '#bee0ff',
          300: '#91ccff',
          400: '#5dadf9',
          500: '#388bf6',
          600: '#1f6df2',
          700: '#1857de',
          800: '#1a47b4',
          900: '#1c3e8e',
          950: '#152856',
        },
        dream: {
          red: '#e5484d',
          green: '#2f9e44',
          blue: '#1c7ed6',
          orange: '#f08c00',
          purple: '#9c36b5',
        },
        ink: {
          50: '#f7f8fa',
          100: '#eef0f4',
          200: '#dde1e9',
          300: '#c2c8d5',
          400: '#9aa3b8',
          500: '#737d96',
          600: '#5b6580',
          700: '#4a5269',
          800: '#40465a',
          900: '#1b2236',
          950: '#11162a',
        },
        success: {
          50: '#ebfbee', 100: '#c6f6cd', 200: '#9ae9a6', 300: '#6dd58a',
          400: '#46c072', 500: '#2f9e44', 600: '#228d34', 700: '#1c722b',
          800: '#1a5a27', 900: '#164a24', 950: '#0a2c14',
        },
        warning: {
          50: '#fff9db', 100: '#fff3bf', 200: '#ffec99', 300: '#ffe066',
          400: '#ffd43b', 500: '#fcc419', 600: '#fab005', 700: '#f08c00',
          800: '#e67700', 900: '#b35c00', 950: '#5c3900',
        },
        error: {
          50: '#fff5f5', 100: '#ffe3e3', 200: '#ffc9c9', 300: '#ffa8a8',
          400: '#ff8787', 500: '#fa5252', 600: '#e5484d', 700: '#c92a2a',
          800: '#a61e1e', 900: '#8c1c1c', 950: '#5c0f0f',
        },
        accent: {
          50: '#fff8f0', 100: '#ffeed6', 200: '#ffdca8', 300: '#ffc570',
          400: '#ffa940', 500: '#f08c00', 600: '#d9730c', 700: '#b3590c',
          800: '#8f450f', 900: '#74390f', 950: '#46200a',
        },
      },
      backgroundImage: {
        'dream-gradient': 'linear-gradient(135deg, #e5484d 0%, #f08c00 25%, #2f9e44 50%, #1c7ed6 75%, #9c36b5 100%)',
        'dream-gradient-soft': 'linear-gradient(135deg, rgba(229,72,77,0.10) 0%, rgba(240,140,0,0.10) 25%, rgba(47,158,68,0.10) 50%, rgba(28,126,214,0.10) 75%, rgba(156,54,181,0.10) 100%)',
        'hero-overlay': 'linear-gradient(180deg, rgba(17,22,42,0.55) 0%, rgba(17,22,42,0.82) 100%)',
        'noise': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(27,34,54,0.07), 0 10px 40px -10px rgba(27,34,54,0.08)',
        'card': '0 4px 24px -4px rgba(27,34,54,0.10), 0 12px 48px -12px rgba(27,34,54,0.12)',
        'glow-blue': '0 0 0 1px rgba(31,109,242,0.1), 0 8px 30px -6px rgba(31,109,242,0.35)',
        'glow-dream': '0 8px 40px -8px rgba(156,54,181,0.4)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(3deg)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        'blob': {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.8s ease both',
        'scale-in': 'scale-in 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'float': 'float 5s ease-in-out infinite',
        'float-slow': 'float-slow 9s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'gradient-pan': 'gradient-pan 8s ease infinite',
        'pulse-ring': 'pulse-ring 2.5s cubic-bezier(0.22,1,0.36,1) infinite',
        'blob': 'blob 12s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};
