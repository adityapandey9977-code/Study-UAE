/* eslint-disable import/no-anonymous-default-export */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '16px',
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1800px',
      '4xl': '2200px',
      '5xl': '2400px',
      '6xl': '2600px',
    },
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}

