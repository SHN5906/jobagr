/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--bg-surface)',
        raised: 'var(--bg-raised)',
        accent: 'var(--accent)',
        'accent-fg': 'var(--accent-fg)',
        ink: 'var(--text)',
        'ink-2': 'var(--text-2)',
        'ink-3': 'var(--text-3)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        subtle: 'var(--border-2)',
      },
    },
  },
  plugins: [],
}

