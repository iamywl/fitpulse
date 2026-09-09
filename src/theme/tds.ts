export type TdsThemeMode = 'light' | 'dark';

export const TDS_COLORS = {
  // Toss Signature Blue
  primary: '#3182F6',
  primaryHover: '#1B64DA',
  primaryActive: '#1552B5',
  primaryLight: '#E8F3FF', // Blue Weak Light
  primaryDarkTint: 'rgba(49, 130, 246, 0.16)', // Blue Weak Dark

  // Toss Greys (Light Mode)
  grey: {
    50: '#F9FAFB',
    100: '#F2F4F6', // Toss Signature Background
    200: '#E5E8EB', // Hairline Border
    300: '#D1D6DB',
    400: '#B0B8C1',
    500: '#8B95A1', // Caption / Muted
    600: '#6B7684',
    700: '#4E5968', // Secondary Text (Elephant)
    800: '#333D4B', // Subtitle Text
    900: '#191F28', // Primary Heading Text
  },

  // Toss Dark Mode Surfaces
  dark: {
    bg: '#101012',         // OLED Deep Charcoal Base
    card: '#1C1C1E',       // Primary Surface
    cardElevated: '#242529',
    cardHover: '#2A2A33',
    border: '#2C2C2E',     // Subtle Hairline
    borderSubtle: '#222226',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B8C1',
    textMuted: '#6B7684',
  },

  // TDS Semantic Color Pairs: Fill (Solid) & Weak (Tint)
  semantic: {
    blue: {
      fill: '#3182F6',
      fillText: '#FFFFFF',
      weakLight: '#E8F3FF',
      weakLightText: '#1B64DA',
      weakDark: 'rgba(49, 130, 246, 0.16)',
      weakDarkText: '#5B9DF8',
    },
    teal: {
      fill: '#00BFA5',
      fillText: '#FFFFFF',
      weakLight: '#E0F7F4',
      weakLightText: '#00897B',
      weakDark: 'rgba(0, 191, 165, 0.16)',
      weakDarkText: '#2DD4BF',
    },
    green: {
      fill: '#00C73C',
      fillText: '#FFFFFF',
      weakLight: '#E8F9EE',
      weakLightText: '#00962B',
      weakDark: 'rgba(0, 199, 60, 0.16)',
      weakDarkText: '#34D399',
    },
    red: {
      fill: '#F04452',
      fillText: '#FFFFFF',
      weakLight: '#FEECEE',
      weakLightText: '#C92A38',
      weakDark: 'rgba(240, 68, 82, 0.16)',
      weakDarkText: '#F87171',
    },
    yellow: {
      fill: '#FF9F00',
      fillText: '#191F28',
      weakLight: '#FFF6E6',
      weakLightText: '#B86A00',
      weakDark: 'rgba(255, 159, 0, 0.16)',
      weakDarkText: '#FBBF24',
    },
    elephant: {
      fill: '#6B7684',
      fillText: '#FFFFFF',
      weakLight: '#F2F4F6',
      weakLightText: '#4E5968',
      weakDark: '#2C2C2E',
      weakDarkText: '#94A3B8',
    },
  },

  // Toss Activity Heatmap (5-level Calm Gradient)
  heatmap: {
    light: {
      level0: '#E5E8EB',
      level1: '#B9D5FD',
      level2: '#75ABF8',
      level3: '#3182F6',
      level4: '#1B64DA',
    },
    dark: {
      level0: '#1C1C1E',
      level1: '#152945',
      level2: '#1B477D',
      level3: '#2565B8',
      level4: '#3182F6',
    },
  },
} as const;
