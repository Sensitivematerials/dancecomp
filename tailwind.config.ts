import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
        display: ["Bebas Neue", "sans-serif"],
      },
      colors: {
        stage:    "#ffd060",
        green:    "#20d49c",
        amber:    "#f5a82a",
        pink:     "#f05aa8",
        red:      "#ff5258",
        blue:     "#5b9fff",
        prop:     "#ff8c00",
      },
    },
  },
  plugins: [],
};
export default config;
