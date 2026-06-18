/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        archive: {
          paper: "#f5efe3",
          ink: "#173f2a",
          moss: "#6d8b63",
          pale: "#e8efdf",
          line: "#c9d6bd",
          label: "#fbf8ef",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        specimen: "0 18px 50px rgba(42, 64, 43, 0.12)",
      },
    },
  },
  plugins: [],
};
