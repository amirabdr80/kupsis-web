/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   '#b34700',
        secondary: '#e8671a',
        accent:    '#f5a623',
        green:     '#1e8449',
        red:       '#c0392b',
        light:     '#fff3e8',
        bg:        '#fdf6f0',
        muted:     '#8a6040',
        border:    '#f0d5bc',
        card:      '#ffffff',
        textdark:  '#2c1a0e',
      },
      backgroundImage: {
        'brand':    'linear-gradient(135deg, #8a3200 0%, #e8671a 60%, #f5a623 100%)',
        'brand-dk': 'linear-gradient(135deg, #8a3200, #e8671a)',
      },
    },
  },
  plugins: [],
}
