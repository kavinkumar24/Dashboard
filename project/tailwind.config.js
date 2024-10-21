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
        'screen-1xl':'10rem',
        
        'screen-6xl': '96rem', // Adjust as needed
        'screen-4xl': '64rem', // Adjust as needed
        'screen-3xl':'48rem',
        'screen-5xl':'77rem',
        
        'screen-7xl': '110rem', // Adjust as needed
        'screen-8xl': '110rem', // Adjust as needed
      },
    },
  },
  plugins: [],
}

