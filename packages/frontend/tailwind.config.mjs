/** @type {import('tailwindcss').Config} */
export default {
  // Keep dark mode variant structure if needed later, but colors will be defined below
  darkMode: [
    'variant',
    [
      '@media (prefers-color-scheme: dark) { &:not(.light *) }',
      '&:is(.dark *)',
    ],
  ],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Wabi-Sabi Palette
        background: '#F8F7F4',    // Warm off-white / Beige
        foreground: '#333333',    // Dark gray for text
        card: '#FFFFFF',         // White for cards
        'card-foreground': '#333333',
        muted: '#EAE8E1',        // Light brownish-gray
        'muted-foreground': '#737373', // Medium gray text
        accent: '#B88B4A',        // Ochre / Muted Gold
        'accent-foreground': '#FFFFFF', // Text on accent
        border: '#DCD9CF',        // Light border color

        // Remove or comment out previous sds colors if unused
        // 'sds-light': 'var(--sds-light)',
        // 'sds-dark': 'var(--sds-dark)',
        // 'sds-pink': 'var(--sds-pink)',
        // 'sds-blue': 'var(--sds-blue)',
        // 'sds-accent-a11': 'var(--accent-a11)',
      },
      fontFamily: {
        // Keep Inter, add sans-serif fallback. Ensure 'Inter' font is loaded.
        // Add Chinese font fallback if needed and loaded.
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif', '"Source Han Sans SC"', '"Noto Sans CJK SC"'], 
        inter: 'var(--sds-font-inter)', // Keep if var is still used elsewhere, otherwise remove
      },
      boxShadow: {
        // Remove or comment out previous toast shadow
        // toast: 'inset 0 0 0 1px var(--accent-a7)',
      },
    },
  },
  plugins: [],
}
