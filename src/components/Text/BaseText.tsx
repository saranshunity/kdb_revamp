import React from 'react';
import { Text } from 'react-native';
import { FONTS, FONT_WEIGHTS } from '../../constants/fonts';
import { COLORS } from '../../constants/colors';
import { BaseTextProps } from '../../types/text';
import { getFontSize, getLineHeight } from '../../utils/textUtils';

const BaseText: React.FC<BaseTextProps> = ({
  children,
  fontFamily = 'regular',
  fontSize,
  color = 'primary',
  textAlign = 'left',
  lineHeight,
  letterSpacing,
  textDecorationLine,
  textTransform,
  numberOfLines,
  ellipsizeMode = 'tail',
  allowFontScaling = true,
  adjustsFontSizeToFit = false,
  minimumFontScale = 0.5,
  maxFontSizeMultiplier = 1.2,
  selectable = false,
  style,
  variant,
  weight,
  size,
  truncate = false,
  center = false,
  right = false,
  muted = false,
  bold = false,
  italic = false,
  underline = false,
  strikethrough = false,
  ...props
}) => {
  // Get final values
  const finalFontFamily = FONTS.gilroy[weight || fontFamily];
  const finalFontSize = getFontSize(size, fontSize);
  const finalTextAlign = center ? 'center' : right ? 'right' : textAlign;
  const finalLineHeight = getLineHeight(finalFontSize, lineHeight);

  // Handle color
  let finalColor = color;
  if (typeof color === 'string' && color in COLORS) {
    finalColor = COLORS[color as keyof typeof COLORS];
  }
  if (variant && variant in COLORS) {
    finalColor = COLORS[variant as keyof typeof COLORS];
  }
  if (muted) {
    finalColor = COLORS.text.muted;
  }

  // Handle text decoration
  let finalTextDecorationLine = textDecorationLine;
  if (underline && strikethrough) {
    finalTextDecorationLine = 'underline line-through';
  } else if (underline) {
    finalTextDecorationLine = 'underline';
  } else if (strikethrough) {
    finalTextDecorationLine = 'line-through';
  }

  // Handle truncation
  const finalNumberOfLines = truncate ? 1 : numberOfLines;
  const finalEllipsizeMode = truncate ? 'tail' : ellipsizeMode;

  return (
    <Text
      style={[
        {
          fontFamily: finalFontFamily,
          fontSize: finalFontSize,
          color: finalColor,
          textAlign: finalTextAlign,
          lineHeight: finalLineHeight,
          letterSpacing,
          textDecorationLine: finalTextDecorationLine,
          textTransform,
          fontWeight: bold ? '700' : FONT_WEIGHTS[weight || fontFamily],
          fontStyle: italic ? 'italic' : 'normal',
        },
        style,
      ]}
      numberOfLines={finalNumberOfLines}
      ellipsizeMode={finalEllipsizeMode}
      allowFontScaling={allowFontScaling}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      selectable={selectable}
      {...props}
    >
      {children}
    </Text>
  );
};

export default BaseText;
