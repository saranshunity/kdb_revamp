import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  BodyText,
  BodyMedium,
  BodyBold,
  SmallText,
  LargeText,
  CaptionText,
  CaptionBold,
  HelperText,
  ErrorText,
  ButtonTextPrimary,
  ButtonTextSecondary,
  ButtonTextOutline,
  FormLabel,
  ErrorLabel,
  OptionalLabel,
  BaseText,
  ButtonTextSmall,
  ButtonTextLarge,
} from './index';

const TextShowcase: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Headings */}
      <View style={styles.section}>
        <H1>Heading 1 - Main Title</H1>
        <H2>Heading 2 - Section Title</H2>
        <H3>Heading 3 - Subsection</H3>
        <H4>Heading 4 - Card Title</H4>
        <H5>Heading 5 - Small Title</H5>
        <H6>Heading 6 - Tiny Title</H6>
      </View>

      {/* Body Text */}
      <View style={styles.section}>
        <H3>Body Text Variants</H3>
        <BodyText>
          Regular body text - This is the default body text style.
        </BodyText>
        <BodyMedium>Medium body text - This has medium weight.</BodyMedium>
        <BodyBold>Bold body text - This has bold weight.</BodyBold>
        <SmallText>
          Small text - This is smaller than regular body text.
        </SmallText>
        <LargeText>
          Large text - This is larger than regular body text.
        </LargeText>
      </View>

      {/* Captions and Helper Text */}
      <View style={styles.section}>
        <H3>Captions & Helper Text</H3>
        <CaptionText>Regular caption text</CaptionText>
        <CaptionBold>Bold caption text</CaptionBold>
        <HelperText>
          This is helper text that provides additional information
        </HelperText>
        <ErrorText>This is error text that shows validation errors</ErrorText>
      </View>

      {/* Button Text */}
      <View style={styles.section}>
        <H3>Button Text Variants</H3>
        <View style={styles.buttonContainer}>
          <ButtonTextPrimary>Primary Button</ButtonTextPrimary>
          <ButtonTextSecondary>Secondary Button</ButtonTextSecondary>
          <ButtonTextOutline>Outline Button</ButtonTextOutline>
        </View>
        <View style={styles.buttonContainer}>
          <ButtonTextSmall>Small Button</ButtonTextSmall>
          <ButtonTextLarge>Large Button</ButtonTextLarge>
        </View>
      </View>

      {/* Labels */}
      <View style={styles.section}>
        <H3>Form Labels</H3>
        <FormLabel>Required Field Label</FormLabel>
        <OptionalLabel>Optional Field Label</OptionalLabel>
        <ErrorLabel>Error Field Label</ErrorLabel>
      </View>

      {/* Text Features */}
      <View style={styles.section}>
        <H3>Text Features</H3>

        {/* Truncation */}
        <H4>Truncation</H4>
        <BodyText truncate>
          This is a very long text that will be truncated with ellipsis at the
          end
        </BodyText>

        {/* Multiple Lines */}
        <H4>Multiple Lines</H4>
        <BodyText numberOfLines={2}>
          This text will be limited to 2 lines and truncated if it exceeds that
          limit. This is a longer text to demonstrate the multiple lines
          feature.
        </BodyText>

        {/* Text Decoration */}
        <H4>Text Decoration</H4>
        <BodyText underline>Underlined text</BodyText>
        <BodyText strikethrough>Strikethrough text</BodyText>
        <BodyText italic>Italic text</BodyText>
        <BodyText bold>Bold text</BodyText>

        {/* Text Transform */}
        <H4>Text Transform</H4>
        <BodyText textTransform='uppercase'>uppercase text</BodyText>
        <BodyText textTransform='lowercase'>LOWERCASE TEXT</BodyText>
        <BodyText textTransform='capitalize'>capitalize each word</BodyText>

        {/* Colors */}
        <H4>Color Variants</H4>
        <BodyText variant='primary'>Primary text</BodyText>
        <BodyText variant='secondary'>Secondary text</BodyText>
        <BodyText variant='success'>Success text</BodyText>
        <BodyText variant='warning'>Warning text</BodyText>
        <BodyText variant='error'>Error text</BodyText>
        <BodyText variant='info'>Info text</BodyText>
        <BodyText muted>Muted text</BodyText>

        {/* Alignment */}
        <H4>Text Alignment</H4>
        <BodyText center>Centered text</BodyText>
        <BodyText right>Right aligned text</BodyText>
        <BodyText>Left aligned text (default)</BodyText>

        {/* Custom Styling */}
        <H4>Custom Styling</H4>
        <BaseText
          weight='bold'
          size='lg'
          color='#FF6B6B'
          letterSpacing={2}
          textTransform='uppercase'
        >
          Custom Styled Text
        </BaseText>
      </View>

      {/* Accessibility Features */}
      <View style={styles.section}>
        <H3>Accessibility Features</H3>
        <BodyText selectable>
          This text is selectable - you can copy it
        </BodyText>
        <BodyText allowFontScaling={false}>
          This text won't scale with system font size
        </BodyText>
        <BodyText adjustsFontSizeToFit>
          This text adjusts to fit the container
        </BodyText>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
  },
});

export default TextShowcase;
