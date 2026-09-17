/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        temple: {
          gold: '#f59e0b',
          amber: '#d97706',
          vermilion: '#dc2626',
          maroon: '#831843',
          deep: '#450a0a',
          saffron: '#ea580c',
          sand: '#fef3c7',
          cream: '#fffbeb',
          bronze: '#78350f'
        }
      }
    },
  },
  plugins: [],
}
