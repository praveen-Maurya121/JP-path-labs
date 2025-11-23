/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'french-rose': {
          '50': '#fdf2f6',
          '100': '#fbe8f0',
          '200': '#f9d1e2',
          '300': '#f6abc9',
          '400': '#ef77a5',
          '500': '#e65286',
          '600': '#d42e60',
          '700': '#b71f48',
          '800': '#981c3c',
          '900': '#7f1c36',
          '950': '#4d0a1b',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

