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
        'screen-3xl':'48rem',
        'screen-7xl': '112rem', // Adjust as needed
      },
    },
  },
  plugins: [],
}
