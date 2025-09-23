# Project Structure - Gilroy Text Components

## 📁 Folder Structure

```
kdb_revamp_code/
├── src/
│   ├── components/
│   │   └── Text/
│   │       ├── BaseText.tsx          # Core text component
│   │       ├── Heading.tsx           # H1-H6 components
│   │       ├── Body.tsx              # Body text variants
│   │       ├── Caption.tsx           # Caption & helper text
│   │       ├── ButtonText.tsx        # Button text variants
│   │       ├── Label.tsx             # Form labels
│   │       ├── TextShowcase.tsx      # Demo component
│   │       ├── index.ts              # Exports
│   │       └── README.md             # Documentation
│   ├── constants/
│   │   ├── fonts.ts                  # Font constants
│   │   └── colors.ts                 # Color palette
│   ├── types/
│   │   └── text.ts                   # TypeScript interfaces
│   └── utils/
│       └── textUtils.ts              # Text utility functions
├── assets/
│   └── fonts/
│       ├── Gilroy-Regular.ttf
│       ├── Gilroy-Medium.ttf
│       ├── Gilroy-SemiBold.ttf
│       └── Gilroy-Bold.ttf
└── App.tsx                           # Main app with showcase
```

## 🎯 Features Implemented

### ✅ **Robust Text Components**
- **BaseText** - Core component with all features
- **Headings** - H1, H2, H3, H4, H5, H6
- **Body Text** - Regular, Medium, Bold variants
- **Captions** - Helper text, error text, captions
- **Button Text** - Primary, secondary, outline variants
- **Labels** - Form labels with required/error states

### ✅ **Advanced Features**
- **Truncation** - `truncate` prop for single-line truncation
- **Multiple Lines** - `numberOfLines` prop for line limiting
- **Text Decoration** - Underline, strikethrough, italic, bold
- **Text Transform** - Uppercase, lowercase, capitalize
- **Color System** - Semantic colors and variants
- **Size Presets** - Consistent sizing system (xs, sm, md, lg, xl, etc.)
- **Accessibility** - Font scaling, selectable text, screen reader support
- **Responsive** - Adjusts to different screen sizes

### ✅ **TypeScript Support**
- Fully typed interfaces
- Comprehensive prop types
- Type safety for all components
- IntelliSense support

### ✅ **Gilroy Font Integration**
- All components use Gilroy fonts
- Proper font weight mapping
- Font family constants
- iOS and Android support

## 🚀 Usage Examples

### Basic Usage
```tsx
import { H1, BodyText, ButtonTextPrimary } from './src/components/Text';

<H1>Main Title</H1>
<BodyText>Regular body text</BodyText>
<ButtonTextPrimary>Click Me</ButtonTextPrimary>
```

### Advanced Usage
```tsx
import { BaseText } from './src/components/Text';

<BaseText
  weight="bold"
  size="lg"
  color="#FF6B6B"
  truncate
  numberOfLines={2}
  underline
  textTransform="uppercase"
>
  Custom Styled Text
</BaseText>
```

### Form Components
```tsx
import { FormLabel, ErrorText, HelperText } from './src/components/Text';

<FormLabel>Required Field</FormLabel>
<ErrorText>Validation error message</ErrorText>
<HelperText>Additional information</HelperText>
```

## 🎨 Design System

### Font Sizes
- `xs` - 12px
- `sm` - 14px
- `md` - 16px
- `lg` - 18px
- `xl` - 20px
- `2xl` - 24px
- `3xl` - 28px
- `4xl` - 32px

### Font Weights
- `regular` - Gilroy-Regular
- `medium` - Gilroy-Medium
- `semiBold` - Gilroy-SemiBold
- `bold` - Gilroy-Bold

### Color Variants
- `primary` - Black (#000000)
- `secondary` - Gray (#666666)
- `tertiary` - Light Gray (#999999)
- `success` - Green (#28a745)
- `warning` - Yellow (#ffc107)
- `error` - Red (#dc3545)
- `info` - Blue (#17a2b8)

## 📱 Testing

Run the app to see the comprehensive text showcase:
```bash
npm run ios
# or
npm run android
```

The app displays all text components with different features, colors, and styles.

## 🔧 Customization

### Adding New Font Weights
1. Add font file to `assets/fonts/`
2. Update `src/constants/fonts.ts`
3. Update iOS `Info.plist`
4. Rebuild the app

### Adding New Color Variants
1. Update `src/constants/colors.ts`
2. Update `src/types/text.ts`
3. Use in components

### Creating Custom Components
1. Create new component in `src/components/Text/`
2. Export from `src/components/Text/index.ts`
3. Add to showcase if needed

## 🎉 Benefits

- **Consistent Design** - All text follows the same design system
- **Type Safety** - TypeScript prevents errors
- **Performance** - Optimized for React Native
- **Accessibility** - Built-in accessibility features
- **Maintainable** - Well-structured and documented
- **Scalable** - Easy to extend and customize
- **Developer Experience** - Great IntelliSense and documentation
