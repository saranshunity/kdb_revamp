import { TextProps, TextStyle } from 'react-native';

// Font family types
export type FontFamily = 'regular' | 'medium' | 'semiBold' | 'bold';

// Font size types
export type FontSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl';

// Text variant types
export type TextVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

// Text alignment types
export type TextAlign = 'left' | 'center' | 'right' | 'justify' | 'auto';

// Text decoration types
export type TextDecoration =
  | 'none'
  | 'underline'
  | 'line-through'
  | 'underline line-through';

// Text transform types
export type TextTransform = 'none' | 'capitalize' | 'uppercase' | 'lowercase';

// Ellipsize mode types
export type EllipsizeMode = 'head' | 'middle' | 'tail' | 'clip';

// Line height types
export type LineHeight = 'tight' | 'normal' | 'relaxed' | 'loose';

// Base text component props
export interface BaseTextProps extends Omit<TextProps, 'style'> {
  children: React.ReactNode;

  // Font properties
  fontFamily?: FontFamily;
  fontSize?: number;
  weight?: FontFamily;
  size?: FontSize;

  // Color properties
  color?: string;
  variant?: TextVariant;
  muted?: boolean;

  // Layout properties
  textAlign?: TextAlign;
  center?: boolean;
  right?: boolean;
  lineHeight?: number | LineHeight;
  letterSpacing?: number;

  // Text decoration
  textDecorationLine?: TextDecoration;
  textTransform?: TextTransform;
  underline?: boolean;
  strikethrough?: boolean;
  italic?: boolean;
  bold?: boolean;

  // Truncation
  numberOfLines?: number;
  ellipsizeMode?: EllipsizeMode;
  truncate?: boolean;

  // Accessibility
  allowFontScaling?: boolean;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
  maxFontSizeMultiplier?: number;
  selectable?: boolean;

  // Style
  style?: TextStyle | TextStyle[];
}

// Typography component props
export interface TypographyProps
  extends Omit<BaseTextProps, 'fontFamily' | 'fontSize'> {
  // Additional props for specific typography components
}

// Text component variants
export interface HeadingProps extends Omit<TypographyProps, 'variant'> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface BodyProps extends Omit<TypographyProps, 'variant'> {
  variant?: 'regular' | 'medium' | 'bold';
}

export interface CaptionProps extends Omit<TypographyProps, 'variant'> {
  variant?: 'regular' | 'bold';
}

export interface ButtonTextProps extends Omit<TypographyProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export interface LabelProps extends Omit<TypographyProps, 'variant'> {
  required?: boolean;
  error?: boolean;
}
