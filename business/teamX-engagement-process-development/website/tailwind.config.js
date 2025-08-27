/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        teamx: {
          // Primary blues for professional healthcare consulting
          'navy': '#1e3c72',
          'blue': '#2a5298',
          'light-blue': '#4a90c2',
          'accent-blue': '#6bb6ff',
          
          // Trust and healthcare accent colors
          'trust-green': '#10b981',
          'health-teal': '#14b8a6',
          'warm-gray': '#6b7280',
          'cool-gray': '#64748b',
          
          // Professional neutrals
          'charcoal': '#374151',
          'slate': '#475569',
          'light-slate': '#94a3b8',
          'background': '#f8fafc',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        'gradient-accent': 'linear-gradient(135deg, #14b8a6 0%, #10b981 100%)',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'professional': '0 4px 25px -5px rgba(30, 60, 114, 0.25)',
      },
    },
  },
  plugins: [],
}