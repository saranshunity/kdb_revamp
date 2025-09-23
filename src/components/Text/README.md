# Text Components

A comprehensive set of robust text components built with Gilroy fonts for React Native.

## Features

- ✅ **Gilroy Font Integration** - All components use Gilroy font family
- ✅ **TypeScript Support** - Fully typed with comprehensive interfaces
- ✅ **Truncation Support** - Built-in text truncation with ellipsis
- ✅ **Multiple Lines** - Control number of lines with `numberOfLines`
- ✅ **Text Decoration** - Underline, strikethrough, italic, bold
- ✅ **Text Transform** - Uppercase, lowercase, capitalize
- ✅ **Color Variants** - Semantic color system
- ✅ **Size Presets** - Consistent sizing system
- ✅ **Accessibility** - Font scaling, selectable text, screen reader support
- ✅ **Responsive** - Adjusts to different screen sizes
- ✅ **Performance** - Optimized for React Native

## Components

### Headings
- `H1`, `H2`, `H3`, `H4`, `H5`, `H6` - Semantic heading components
- `Heading` - Flexible heading component with level prop

### Body Text
- `BodyText` - Regular body text
- `BodyMedium` - Medium weight body text
- `BodyBold` - Bold body text
- `SmallText` - Small text variant
- `LargeText` - Large text variant

### Captions
- `CaptionText` - Regular caption text
- `CaptionBold` - Bold caption text
- `HelperText` - Helper text for forms
- `ErrorText` - Error text for validation

### Button Text
- `ButtonTextPrimary` - Primary button text
- `ButtonTextSecondary` - Secondary button text
- `ButtonTextOutline` - Outline button text
- `ButtonTextSmall` - Small button text
- `ButtonTextLarge` - Large button text

### Labels
- `FormLabel` - Form field labels with required indicator
- `ErrorLabel` - Error state labels
- `OptionalLabel` - Optional field labels

### Base Component
- `BaseText` - Flexible base component with all features

## Usage Examples

### Basic Usage
```tsx
import { H1, BodyText, ButtonTextPrimary } from './src/components/Text';

// Headings
<H1>Main Title</H1>
<H2>Section Title</H2>

// Body text
<BodyText>Regular body text</BodyText>
<BodyMedium>Medium weight text</BodyMedium>

// Button text
<ButtonTextPrimary>Click Me</ButtonTextPrimary>
```

### Advanced Usage
```tsx
import { BaseText } from './src/components/Text';

// Custom styling
<BaseText
  weight="bold"
  size="lg"
  color="#FF6B6B"
  letterSpacing={2}
  textTransform="uppercase"
  truncate
>
  Custom Styled Text
</BaseText>

// Multiple lines with truncation
<BaseText numberOfLines={2} ellipsizeMode="tail">
  This text will be limited to 2 lines and truncated if it exceeds that limit.
</BaseText>

// Text decoration
<BaseText underline>Underlined text</BaseText>
<BaseText strikethrough>Strikethrough text</BaseText>
<BaseText italic>Italic text</BaseText>
<BaseText bold>Bold text</BaseText>
```

### Form Labels
```tsx
import { FormLabel, ErrorLabel, HelperText } from './src/components/Text';

<FormLabel>Required Field</FormLabel>
<ErrorLabel>Error Field</ErrorLabel>
<HelperText>This field is required</HelperText>
```

## Props

### BaseTextProps
- `children` - Text content
- `fontFamily` - Font family ('regular' | 'medium' | 'semiBold' | 'bold')
- `fontSize` - Custom font size
- `weight` - Font weight
- `size` - Size preset ('xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl')
- `color` - Text color (string or color key)
- `variant` - Color variant ('primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'info')
- `textAlign` - Text alignment
- `center` - Center align text
- `right` - Right align text
- `lineHeight` - Line height (number or preset)
- `letterSpacing` - Letter spacing
- `textDecorationLine` - Text decoration
- `textTransform` - Text transform
- `underline` - Add underline
- `strikethrough` - Add strikethrough
- `italic` - Make text italic
- `bold` - Make text bold
- `numberOfLines` - Limit number of lines
- `ellipsizeMode` - Ellipsis mode
- `truncate` - Enable truncation
- `allowFontScaling` - Allow font scaling
- `adjustsFontSizeToFit` - Adjust font size to fit
- `selectable` - Make text selectable
- `muted` - Apply muted color
- `style` - Additional styles

## File Structure
```
src/components/Text/
├── BaseText.tsx          # Base text component
├── Heading.tsx           # Heading components
├── Body.tsx              # Body text components
├── Caption.tsx           # Caption components
├── ButtonText.tsx        # Button text components
├── Label.tsx             # Label components
├── TextShowcase.tsx      # Example showcase
├── index.ts              # Exports
└── README.md             # Documentation
```

## Dependencies
- React Native Text component
- Gilroy font family
- TypeScript
- Custom color and font constants
