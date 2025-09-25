// Color palette
export const COLORS = {
  // Primary colors
  primary: '#000000',
  secondary: '#666666',
  tertiary: '#999999',

  // Semantic colors
  success: '#28a745',
  warning: '#ffc107',
  error: '#dc3545',
  info: '#17a2b8',

  // Basic colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  appColor: '#febd2f',

  // Gray scale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Text colors
  text: {
    primary: '#000000',
    secondary: '#666666',
    tertiary: '#999999',
    inverse: '#ffffff',
    muted: '#6b7280',
    disabled: '#9ca3af',
  },

  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    inverse: '#000000',
    appColor:'#febd2f'
  },

  // Border colors
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
  },
} as const;
