/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        'cine-black': '#141414',
        'cine-black-deep': '#000000',
        'cine-card': '#181818',
        'cine-surface': '#222222',
        'cine-red': '#E50914',
        'cine-red-dark': '#B20710',
        'cine-gray': '#808080',
        'cine-gray-light': '#B3B3B3',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'cine-glow': '0 0 15px rgba(229, 9, 20, 0.4)',
        'cine-card': '0 8px 30px rgba(229, 9, 20, 0.25)',
      },
    },
  },
  plugins: [],
};
