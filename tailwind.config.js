/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          void: "#050608",
          dark: "#090A0F",
          card: "#0f111a",
          panel: "#141724",
          border: "#23283d",
          accent: "#2e3450",
          cyan: "#00f3ff",
          magenta: "#ff007f",
          purple: "#a855f7",
          neonPurple: "#bc13fe",
          amber: "#ffaa00",
          green: "#00ff75",
          blue: "#0077ff",
          crimson: "#ff2a55",
          danger: "#ef4444",
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        sans: ['Rajdhani', 'Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 243, 255, 0.5), inset 0 0 10px rgba(0, 243, 255, 0.2)',
        'neon-magenta': '0 0 15px rgba(255, 0, 127, 0.5), inset 0 0 10px rgba(255, 0, 127, 0.2)',
        'neon-purple': '0 0 15px rgba(188, 19, 254, 0.5), inset 0 0 10px rgba(188, 19, 254, 0.2)',
        'neon-green': '0 0 15px rgba(0, 255, 117, 0.5), inset 0 0 10px rgba(0, 255, 117, 0.2)',
        'neon-amber': '0 0 15px rgba(255, 170, 0, 0.5), inset 0 0 10px rgba(255, 170, 0, 0.2)',
        'laser-beam': '0 0 25px rgba(0, 243, 255, 0.8), 0 0 50px rgba(255, 0, 127, 0.6)',
        'cyber-panel': '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(0, 243, 255, 0.15)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'laser-flow': 'laserFlow 1.5s linear infinite',
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 0.3s ease infinite',
        'subtle-float': 'subtleFloat 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.3)' },
        },
        laserFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        subtleFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
};
