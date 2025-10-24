import React from 'react';
import {
  View,
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { BodyText } from './Text';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <BodyText color={COLORS.text.primary} size='sm' weight='medium' style={styles.label}>
          {label}
        </BodyText>
      )}
      
      <RNTextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={COLORS.text.tertiary}
        {...props}
      />
      
      {error && (
        <BodyText color={COLORS.error} size='xs' style={styles.errorText}>
          {error}
        </BodyText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    marginTop: 4,
  },
});

export default TextInput;
