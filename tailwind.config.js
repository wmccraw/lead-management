/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  safelist: [
    'bg-gray-100',
    'text-3xl',
    'font-bold',
    'text-gray-800',
    'mt-4',
    'hidden',
    'bg-green-500',
    'text-white',
    'px-4',
    'py-2',
    'rounded',
    'hover:bg-green-600'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}