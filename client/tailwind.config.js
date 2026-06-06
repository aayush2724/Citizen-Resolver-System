/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary palette (civic-tech blue)
        primary: "#1F345E",
        "primary-container": "#213D76",
        "primary-fixed-dim": "#3adfab",
        
        // Surface colors
        surface: "#E0EDF8",
        "surface-container": "#E0EDF8",
        "surface-container-low": "#E0EDF8",
        "surface-container-high": "#7E8AA9",
        "surface-container-highest": "#dce4de",
        "surface-container-lowest": "#ffffff",
        "surface-bright": "#E0EDF8",
        "surface-tint": "#1F345E",
        "surface-dim": "#d4dcd6",
        
        // Text colors
        "on-surface": "#161d1a",
        "on-surface-variant": "#7E8AA9",
        "on-primary": "#ffffff",
        "on-secondary": "#1c1b1b",
        "on-secondary-container": "#636262",
        "on-secondary-fixed-variant": "#00513b",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#344459",
        "on-tertiary-fixed": "#0b1c30",
        
        // Outline colors
        outline: "#7E8AA9",
        "outline-variant": "#7E8AA9",
        
        // Status colors
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        
        // Secondary/tertiary
        secondary: "#5f5e5e",
        "secondary-container": "#e2dfde",
        "secondary-fixed-dim": "#c8c6c5",
        tertiary: "#344459",
        "tertiary-fixed": "#d3e4fe",
        "tertiary-fixed-dim": "#b7c8e1",
        
        // Inverse
        "inverse-surface": "#2a322e",
        
        // Text dark for compatibility
        "text-dark": "#161d1a",
        background: "#F9F7F2",
      },
      borderRadius: {
        "radius-sm": "0.5rem",
        "radius-md": "1rem",
        "radius-lg": "2rem",
        "radius-xl": "2.5rem",
        "radius-2xl": "3rem",
        "radius-full": "9999px",
      },
      spacing: {
        "container-max": "1200px",
        "section-gap": "80px",
        "margin-desktop": "40px",
        "gutter": "24px",
        "unit": "8px",
        "margin-mobile": "16px"
      },
      fontFamily: {
        "headline-md": ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        "label-md": ["Manrope", "system-ui", "sans-serif"],
        "label-bold": ["Manrope", "system-ui", "sans-serif"],
        "headline-lg": ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        "body-md": ["Manrope", "system-ui", "sans-serif"],
        "display-lg": ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        "body-lg": ["Manrope", "system-ui", "sans-serif"],
      },
      fontSize: {
        "headline-md": ["24px", {"lineHeight": "1.3", "fontWeight": "700"}],
        "label-md": ["14px", {"lineHeight": "1.2", "fontWeight": "500"}],
        "label-sm": ["12px", {"lineHeight": "1.2", "fontWeight": "500"}],
        "label-bold": ["14px", {"lineHeight": "1.2", "letterSpacing": "0.05em", "fontWeight": "700"}],
        "headline-lg": ["32px", {"lineHeight": "1.2", "fontWeight": "700"}],
        "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
        "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "800"}],
        "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}]
      },
      boxShadow: {
        "premium": "0 24px 60px -12px rgba(31,52,94,0.15), 0 8px 20px -8px rgba(31,52,94,0.12)",
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries")
  ],
};
