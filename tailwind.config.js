/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Vazirmatn", "Tahoma", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f2f8f7",
          100: "#dcece9",
          200: "#b8d9d3",
          300: "#8bc0b6",
          400: "#5aa295",
          500: "#3d867a",
          600: "#2e6b61",
          700: "#27564f",
          800: "#224540",
          900: "#1d3a36",
          950: "#0e211f",
        },
        ink: {
          50: "#f6f7f7",
          100: "#e2e4e4",
          200: "#c5c9ca",
          300: "#a1a7a8",
          400: "#7c8385",
          500: "#61686a",
          600: "#4d5355",
          700: "#3f4445",
          800: "#2c2f30",
          900: "#1c1e1f",
          950: "#0f1011",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 8px -2px rgb(0 0 0 / 0.06)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.06), 0 8px 24px -4px rgb(0 0 0 / 0.08)",
        soft: "0 2px 4px 0 rgb(0 0 0 / 0.03)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
