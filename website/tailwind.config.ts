import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-primary': '#0F172A',
        'bg-surface': '#1E293B',
        'bg-surface-hover': '#334155',

        // Text
        'text-primary': '#F8FAFC',
        'text-secondary': '#CBD5E1',
        'text-tertiary': '#64748B',

        // Brand
        'brand-primary': '#7C3AED',
        'brand-primary-hover': '#6D28D9',
        'brand-secondary': '#2563EB',
        'brand-accent': '#F59E0B',

        // Functional
        'success': '#10B981',
        'error': '#EF4444',
        'warning': '#F97316',

        // Borders
        'border-subtle': 'rgba(226, 232, 240, 0.1)',
        'border-default': 'rgba(226, 232, 240, 0.15)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      fontSize: {
        'display-xl': ['56px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['40px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-md': ['32px', { lineHeight: '1.25' }],
        'display-sm': ['24px', { lineHeight: '1.33' }],
        'body-lg': ['18px', { lineHeight: '1.6' }],
        'body': ['16px', { lineHeight: '1.6' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
        'caption': ['12px', { lineHeight: '1.4' }],
      },
      spacing: {
        // Keep all default Tailwind spacing, just add custom values
        '18': '72px',
        '88': '352px',
        '128': '512px',
      },
      borderRadius: {
        // Keep defaults, just override specific values
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'md': '0 2px 4px rgba(0, 0, 0, 0.4)',
        'lg': '0 4px 8px rgba(0, 0, 0, 0.5)',
        'hover': '0 6px 12px rgba(0, 0, 0, 0.6)',
        'brand': '0 0 0 3px rgba(124, 58, 237, 0.3)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
