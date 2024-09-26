/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'punche-blue': {
          DEFAULT: '#0866ae',  // Color azul principal
          50: '#e6f2fc',       // Tint más claro
          100: '#cce5f9',
          200: '#99cbf3',
          300: '#66b1ed',
          400: '#3397e7',
          500: '#0866ae',      // Color principal
          600: '#075b9d',
          700: '#064d84',
          800: '#043f6b',
          900: '#033254',      // Shade más oscuro
        },
        'punche-red': {
          DEFAULT: '#E30613',  // Color rojo principal
          50: '#fce6e8',       // Tint más claro
          100: '#f9ccd1',
          200: '#f399a4',
          300: '#ed6676',
          400: '#e73349',
          500: '#E30613',      // Color principal
          600: '#cc0511',
          700: '#b2050f',
          800: '#99040d',
          900: '#7f030b',      // Shade más oscuro
        },
        'punche-green': {
          DEFAULT: '#1ca05a',  // Color verde principal
          50: '#e7f8ef',       // Tint más claro
          100: '#cff1de',
          200: '#9fe3bc',
          300: '#6fd49b',
          400: '#3fc679',
          500: '#1ca05a',      // Color principal
          600: '#188b51',
          700: '#147547',
          800: '#105f3d',
          900: '#0c4933',      // Shade más oscuro
        }
      },
    },
  },

  plugins: [],
}

