/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gym: {
          bg: '#09090B',
          card: '#111115',
          cardHover: '#18181F',
          border: '#272732',
          accent: '#CCFF00', // Nike Volt / Pantone 2288 C
          accentGlow: '#D4FF00',
          neon: '#CCFF00',
          textMuted: '#94a3b8',
        },
        pantone: {
          volt: '#CCFF00',        // Pantone 2288 C (Nike Volt)
          voltBright: '#D4FF00',
          cyan: '#00B4D8',        // Pantone 2995 C (Electric Deep Cyan)
          cyanBright: '#38BDF8',
          crimson: '#FF334B',     // Pantone 1788 C (Vivid Crimson)
          gold: '#F59E0B',        // Pantone 14-0848 TCX
          carbon: {
            900: '#09090B',       // Obsidian True Carbon Base
            850: '#111115',       // Elevated Card Surface
            800: '#18181F',       // Interactive Hover Surface
            750: '#1F1F27',       // Modal Elevated
            700: '#272732',       // Crisp Hairline Border
            600: '#3F3F50',       // Active Divider
          },
        }
      }
    },
  },
  plugins: [],
}
