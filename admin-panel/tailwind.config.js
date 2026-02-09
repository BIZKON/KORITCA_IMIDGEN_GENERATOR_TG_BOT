/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cookie: {
          50: "#fef7ed",
          100: "#fdecd4",
          200: "#fad5a8",
          300: "#f6b871",
          400: "#f19038",
          500: "#ee7512",
          600: "#df5b08",
          700: "#b94309",
          800: "#93350e",
          900: "#772d0f",
        },
      },
    },
  },
  plugins: [],
};
