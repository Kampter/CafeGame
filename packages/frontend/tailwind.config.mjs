/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        'realm-bg': '#0D0F12',
        'realm-bg-alt': '#121017',
        'realm-surface-primary': '#1C1A27',
        'realm-surface-secondary': '#1F232C',
        'realm-surface-tertiary': '#252233',
        'realm-text-primary': '#F0F0F5',
        'realm-text-secondary': '#A8A5B3',
        'realm-text-muted': '#6F6C7A',
        'realm-border': '#353240',
        'realm-neon-primary': '#00DFD8',
        'realm-neon-secondary': '#7F5AF0',
        'realm-neon-cta': '#F250A2',
        'realm-neon-cta-alt': '#ADFF2F',
        'realm-neon-warning': '#FF4757',
        'realm-neon-error': '#FF6B35',
        'realm-neutral-dot': '#FFFBF5',
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "Manrope", "Satoshi", "思源黑体", "Noto Sans CJK"],
      },
      boxShadow: {
        'realm-glow-primary-xs': '0 0 5px -1px #00DFD8',
        'realm-glow-primary-sm': '0 0 8px -2px #00DFD8, 0 0 4px -2px #00DFD8',
        'realm-glow-primary-md': '0 0 15px -3px #00DFD8, 0 0 6px -3px #00DFD8',
        'realm-glow-primary-lg': '0 0 25px -5px #00DFD8, 0 0 10px -5px #00DFD8',
        'realm-glow-secondary-xs': '0 0 5px -1px #7F5AF0',
        'realm-glow-secondary-sm': '0 0 8px -2px #7F5AF0, 0 0 4px -2px #7F5AF0',
        'realm-glow-secondary-md': '0 0 15px -3px #7F5AF0, 0 0 6px -3px #7F5AF0',
        'realm-glow-cta-md': '0 0 15px -3px #F250A2, 0 0 6px -3px #F250A2',
        'realm-glow-cta-alt-md': '0 0 15px -3px #ADFF2F, 0 0 6px -3px #ADFF2F',
        'realm-glow-error-md': '0 0 15px -3px #FF6B35, 0 0 6px -3px #FF6B35',
      },
    },
  },
  plugins: [],
}
