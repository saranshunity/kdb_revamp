// Font family constants
export const FONTS = {
  gilroy: {
    regular: 'Gilroy-Regular',
    medium: 'Gilroy-Medium',
    semiBold: 'Gilroy-SemiBold',
    bold: 'Gilroy-Bold',
  },
} as const;

// Font weight mapping
export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
} as const;

// Font size presets
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
  '6xl': 48,
} as const;

// Line height multipliers
export const LINE_HEIGHT_MULTIPLIERS = {
  tight: 1.1,
  normal: 1.2,
  relaxed: 1.4,
  loose: 1.6,
} as const;
