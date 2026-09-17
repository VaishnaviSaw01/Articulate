/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        code: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        comm: {
          50: "#fdf4ff",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
        },
      },
    },
  },
  plugins: [],
};
