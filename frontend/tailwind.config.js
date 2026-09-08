/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#05080B",
        surface: "#0D141B",
        "surface-raised": "#16202A",
        "surface-inset": "#080D12",
        "border-subtle": "rgba(255, 255, 255, 0.07)",
        "border-strong": "rgba(255, 255, 255, 0.14)",
        cyan: { 
          DEFAULT: "#22D3EE", 
          tint: "#7DE7F5",
          dim: "rgba(34, 211, 238, 0.12)"
        },
        violet: { 
          DEFAULT: "#A78BFA", 
          tint: "#D7CCFB",
          dim: "rgba(167, 139, 250, 0.12)"
        },
        amber: { 
          DEFAULT: "#FBBF24", 
          tint: "#FDE49A",
          dim: "rgba(251, 191, 36, 0.12)"
        },
        success: "#34D399",
        danger: "#FB7185",
        warning: "#FB923C",
        "text-primary": "#F2F5F7",
        "text-secondary": "#8B96A3",
        "text-tertiary": "#545E6B",
        "text-on-accent": "#071019",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        full: "999px",
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "-apple-system", "sans-serif"],
        sans: ["Inter", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
