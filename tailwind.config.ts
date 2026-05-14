import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        // shadcn tokens — kept for component compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ClearGroup design system palette
        cg: {
          bg:        "var(--cg-bg)",
          surface:   "var(--cg-surface)",
          border:    "var(--cg-border)",
          primary:   "var(--cg-primary)",
          secondary: "var(--cg-secondary)",
          text:      "var(--cg-text)",
          muted:     "var(--cg-muted)",
          success:   "var(--cg-success)",
          warning:   "var(--cg-warning)",
          danger:    "var(--cg-danger)",
        },
        // Premium blue brand tokens
        brand:    "#3B82F6",
        surface:  "#0C1121",
        elevated: "#111828",
      },
      fontSize: {
        hero:            ["72px", { lineHeight: "1.1",  fontWeight: "700" }],
        "section-title": ["48px", { lineHeight: "1.2",  fontWeight: "600" }],
        subheading:      ["24px", { lineHeight: "1.4",  fontWeight: "500" }],
        body:            ["16px", { lineHeight: "1.7",  fontWeight: "400" }],
        small:           ["14px", { lineHeight: "1.5",  fontWeight: "400" }],
      },
      spacing: {
        section:  "96px",
        cardpad:  "32px",
      },
      maxWidth: {
        container: "1200px",
      },
      borderRadius: {
        lg:     "var(--radius)",
        md:     "calc(var(--radius) - 2px)",
        sm:     "calc(var(--radius) - 4px)",
        card:   "16px",
        button: "10px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
