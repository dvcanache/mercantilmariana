import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        excel: {
          darkGreen: "#274E13",
          mediumGreen: "#38761D",
          vibrantGreen: "#00A758",
          lightSage: "#E2F0D9",
          peach: "#FBE3D6",
          charcoal: "#494949",
          charcoalLight: "#595959",
        },
        win10: {
          bg: "#F0F2F5",
          windowBg: "#FFFFFF",
          border: "#D1D5DB",
          darkBorder: "#9CA3AF",
          titlebar: "#274E13",
          titlebarInactive: "#38761D",
          taskbar: "#1F2937",
          buttonHover: "#E5E7EB",
          buttonActive: "#D1D5DB",
          accent: "#0078D7",
          accentHover: "#106EBE",
        },
      },
      fontFamily: {
        win: [
          "Segoe UI",
          "-apple-system",
          "BlinkMacSystemFont",
          "Roboto",
          "sans-serif",
        ],
        mono: ["Consolas", "Courier New", "monospace"],
      },
      boxShadow: {
        win10: "0 2px 8px rgba(0, 0, 0, 0.15)",
        win10Modal: "0 8px 24px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
