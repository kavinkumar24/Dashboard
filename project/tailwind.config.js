/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",  
  ],
  theme: {
    extend: {
      maxWidth: {
        'screen-6xl': '96rem', // Adjust as needed
        'screen-4xl': '64rem', // Adjust as needed
        'screen-3xl':'48rem',
        'screen-5xl':'65rem',
        'screen-7xl': '100rem', // Adjust as needed
      },
    },
  },
  plugins: [],
}

