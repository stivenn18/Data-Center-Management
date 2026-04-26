/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        display: ['"Rajdhani"', 'sans-serif'],
        body: ['"Exo 2"', 'sans-serif'],
      },
      colors: {
        void: '#050a0e',
        panel: '#080f14',
        surface: '#0d1920',
        border: '#0f3a4a',
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        alert: '#ff4444',
        warn: '#ffaa00',
        safe: '#00ff88',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'glitch': 'glitch 1s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(2px, -2px)' },
          '60%': { transform: 'translate(-1px, 1px)' },
          '80%': { transform: 'translate(1px, -1px)' },
        },
      },
      boxShadow: {
        'cyan': '0 0 20px rgba(6,182,212,0.3)',
        'cyan-lg': '0 0 40px rgba(6,182,212,0.4)',
        'alert': '0 0 20px rgba(255,68,68,0.4)',
        'safe': '0 0 20px rgba(0,255,136,0.3)',
      },
    },
  },
  plugins: [],
}
