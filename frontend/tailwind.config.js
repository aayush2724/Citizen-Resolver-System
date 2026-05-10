/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-secondary-fixed": "#1c1b1b",
        "on-tertiary-container": "#344459",
        "on-primary-fixed-variant": "#00513b",
        "surface-container-lowest": "#ffffff",
        "surface-bright": "#f3fbf5",
        "secondary": "#5f5e5e",
        "surface-tint": "#006c4f",
        "surface": "#f3fbf5",
        "primary-container": "#00c896",
        "outline-variant": "#bbcac1",
        "surface-container": "#e8f0e9",
        "on-tertiary-fixed": "#0b1c30",
        "primary-fixed-dim": "#3adfab",
        "on-secondary-container": "#636262",
        "secondary-fixed-dim": "#c8c6c5",
        "on-surface": "#161d1a",
        "error-container": "#ffdad6",
        "on-tertiary": "#ffffff",
        "surface-container-highest": "#dce4de",
        "on-primary": "#ffffff",
        "tertiary-fixed": "#d3e4fe",
        "secondary-container": "#e2dfde",
        "outline": "#6c7a72",
        "tertiary-fixed-dim": "#b7c8e1",
        "inverse-surface": "#2a322e",
        "error": "#ba1a1a",
        "on-surface-variant": "#3c4a43",
        "primary": "#006c4f",
        "background": "#f3fbf5",
        "surface-container-low": "#eef6ef",
        "surface-container-high": "#e2eae4",
        "surface-dim": "#d4dcd6"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
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
        "headline-md": ["Plus Jakarta Sans"],
        "label-md": ["Manrope"],
        "label-bold": ["Manrope"],
        "headline-lg": ["Plus Jakarta Sans"],
        "body-md": ["Manrope"],
        "display-lg": ["Plus Jakarta Sans"],
        "body-lg": ["Manrope"]
      },
      fontSize: {
        "headline-md": ["24px", {"lineHeight": "1.3", "fontWeight": "700"}],
        "label-md": ["14px", {"lineHeight": "1.2", "fontWeight": "500"}],
        "label-bold": ["14px", {"lineHeight": "1.2", "letterSpacing": "0.05em", "fontWeight": "700"}],
        "headline-lg": ["32px", {"lineHeight": "1.2", "fontWeight": "700"}],
        "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
        "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "800"}],
        "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}]
      }
    }
  },
  plugins: [],
};
