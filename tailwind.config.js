/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   '#b34700',
        secondary: '#e8671a',
        accent:    '#f5a623',
        light:     '#fff8ec',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #8a3200 0%, #e8671a 60%, #f5a623 100%)',
      },
    },
  },
  plugins: [],
}
