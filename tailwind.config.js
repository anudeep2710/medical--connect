/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary colors with semantic naming
        primary: {
          DEFAULT: '#0D9488',
          hover: '#0F766E',
          dark: '#5EEAD4',
          'dark-hover': '#2DD4BF',
        },
        // Accent colors
        accent: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          dark: '#60A5FA',
          'dark-hover': '#3B82F6',
        },
        // Background colors
        background: {
          DEFAULT: '#F9FAFB',
          dark: '#111827',
        },
        // Surface colors for cards, etc.
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1F2937',
        },
        // Muted sections
        muted: {
          DEFAULT: '#F3F4F6',
          dark: '#374151',
        },
        // Text colors
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          'primary-dark': '#F9FAFB',
          'secondary-dark': '#D1D5DB',
        },
        // Border colors
        border: {
          DEFAULT: '#E5E7EB',
          dark: '#374151',
        },
        // Status colors
        success: {
          DEFAULT: '#10B981',
          dark: '#34D399',
        },
        error: {
          DEFAULT: '#EF4444',
          dark: '#F87171',
        },
        warning: {
          DEFAULT: '#F59E0B',
          dark: '#FBBF24',
        },
        info: {
          DEFAULT: '#3B82F6',
          dark: '#60A5FA',
        },
        // Keep existing color scales for backwards compatibility
        'primary-old': {
          50: '#eef9ff',
          100: '#d9f1ff',
          200: '#bce4ff',
          300: '#8dd3ff',
          400: '#59b8ff',
          500: '#3499fe',
          600: '#1e7af5',
          700: '#1965e1',
          800: '#1d51b5',
          900: '#1e488d',
          950: '#172a51',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e1f2fe',
          200: '#bce4fe',
          300: '#84d1fc',
          400: '#48b9f9',
          500: '#1e9de9',
          600: '#0e80c6',
          700: '#10679f',
          800: '#145582',
          900: '#16486d',
          950: '#0f2e47',
        },
        'success-old': {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          750: '#2d3748', /* Custom color for dark striped rows */
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        none: 'none',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
    },
  },
  plugins: [],
  important: true,
}
