import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111315",
        canvas: "#f4efe6",
        sand: "#ddd1b7",
        clay: "#c56b37",
        ocean: "#244a5f",
        moss: "#41533f",
        card: "#fffaf2",
      },
      boxShadow: {
        panel: "0 24px 80px rgba(17, 19, 21, 0.12)",
      },
      backgroundImage: {
        "mesh-radial":
          "radial-gradient(circle at top, rgba(197, 107, 55, 0.22), transparent 38%), radial-gradient(circle at 10% 40%, rgba(36, 74, 95, 0.16), transparent 30%), radial-gradient(circle at 85% 25%, rgba(65, 83, 63, 0.12), transparent 24%)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out both",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
