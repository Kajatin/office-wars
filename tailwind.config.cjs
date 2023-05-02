/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        shine: "shine 4s ease-in-out infinite",
      },
      keyframes: {
        shine: {
          "0%": { left: "0%" },
          "10%": { left: "125%" },
          "100%": { left: "125%" },
        },
      },
    },
  },
  plugins: [],
};
