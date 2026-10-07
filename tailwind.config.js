/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        border: '#e2e8f0',
        'border-subtle': '#f1f5f9',
        primary: {
          DEFAULT: '#0f172a',
          hover: '#1e293b',
          muted: '#334155',
        },
        security: {
          safe: {
            bg: '#f0fdf4',
            border: '#bbf7d0',
            text: '#15803d',
            dot: '#22c55e'
          },
          suspicious: {
            bg: '#fffbe6',
            border: '#fef08a',
            text: '#b45309',
            dot: '#f59e0b'
          },
          risk: {
            bg: '#fef2f2',
            border: '#fecaca',
            text: '#b91c1c',
            dot: '#ef4444'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        elevated: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.03)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
};
