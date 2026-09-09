/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tds: {
          blue: '#3182F6',
          blueHover: '#1B64DA',
          blueActive: '#1552B5',
          blueLight: '#E8F3FF',
          teal: '#00BFA5',
          green: '#00C73C',
          red: '#F04452',
          yellow: '#FF9F00',
          elephant: '#6B7684',
          light: {
            bg: '#F2F4F6',
            card: '#FFFFFF',
            border: '#E5E8EB',
            text: '#191F28',
            subtitle: '#4E5968',
            muted: '#8B95A1',
          },
          dark: {
            bg: '#101012',
            card: '#1C1C1E',
            cardElevated: '#242529',
            cardHover: '#2A2A33',
            border: '#2C2C2E',
            text: '#FFFFFF',
            subtitle: '#B0B8C1',
            muted: '#6B7684',
          }
        },
        gym: {
          bg: '#0B0D11',
          card: '#141720',
          cardHover: '#1B1E29',
          border: '#242938',
          accent: '#F8FAFC',
          accentGlow: '#FFFFFF',
          titanium: '#D8D3C8',
          amber: '#F97316',
          textMuted: '#94a3b8',
        },
        pantone: {
          titanium: '#D8D3C8',    // Pantone 14-1116 TPG (Warm Titanium)
          pearl: '#F8FAFC',       // Pantone 11-0601 TPG (Bright White)
          amber: '#F97316',       // Pantone 16-1364 TCX (Ceramic Ultra Amber)
          ice: '#7DD3FC',         // Pantone 14-4115 TCX (Arctic Ice Slate)
          crimson: '#F87171',     // Pantone 1795 C (Matte Crimson)
          carbon: {
            900: '#0B0D11',       // Pantone Black 6 C Base
            850: '#141720',       // Elevated Card Surface L1
            800: '#1B1E29',       // Interactive Hover L2
            750: '#222736',       // Modal Elevated L3
            700: '#242938',       // Crisp Hairline Border
            600: '#3B435C',       // Active Focused Border
          },
        }
      }
    },
  },
  plugins: [],
}
