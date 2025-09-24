// Base component
export { default as BaseText } from './BaseText';

// Heading components
export { default as Heading, H1, H2, H3, H4, H5, H6 } from './Heading';

// Body text components
export {
  default as Body,
  BodyText,
  BodyMedium,
  BodyBold,
  SmallText,
  LargeText,
} from './Body';

// Caption components
export {
  default as Caption,
  CaptionText,
  CaptionBold,
  HelperText,
  ErrorText,
} from './Caption';

// Button text components
export {
  default as ButtonText,
  ButtonTextPrimary,
  ButtonTextSecondary,
  ButtonTextOutline,
  ButtonTextSmall,
  ButtonTextLarge,
} from './ButtonText';

// Label components
export {
  default as Label,
  FormLabel,
  ErrorLabel,
  OptionalLabel,
} from './Label';

// Re-export types
export type {
  BaseTextProps,
  TypographyProps,
  HeadingProps,
  BodyProps,
  CaptionProps,
  ButtonTextProps,
  LabelProps,
} from '../../types/text';
