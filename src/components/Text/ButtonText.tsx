import React from 'react';
import BaseText from './BaseText';
import { ButtonTextProps } from '../../types/text';

const ButtonText: React.FC<ButtonTextProps> = ({
  variant = 'primary',
  size = 'md',
  center = true,
  weight = 'semiBold',
  ...props
}) => {
  const getSize = (size: string) => {
    switch (size) {
      case 'sm':
        return 'sm';
      case 'lg':
        return 'lg';
      default:
        return 'md';
    }
  };

  const getColor = (variant: string) => {
    switch (variant) {
      case 'secondary':
        return 'secondary';
      case 'outline':
        return 'primary';
      default:
        return 'white';
    }
  };

  return (
    <BaseText
      weight={weight}
      size={getSize(size)}
      color={getColor(variant)}
      center={center}
      {...props}
    />
  );
};

// Predefined button text components
export const ButtonTextPrimary: React.FC<
  Omit<ButtonTextProps, 'variant'>
> = props => <ButtonText variant='primary' {...props} />;

export const ButtonTextSecondary: React.FC<
  Omit<ButtonTextProps, 'variant'>
> = props => <ButtonText variant='secondary' {...props} />;

export const ButtonTextOutline: React.FC<
  Omit<ButtonTextProps, 'variant'>
> = props => <ButtonText variant='outline' {...props} />;

// Small button text
export const ButtonTextSmall: React.FC<
  Omit<ButtonTextProps, 'size'>
> = props => <ButtonText size='sm' {...props} />;

// Large button text
export const ButtonTextLarge: React.FC<
  Omit<ButtonTextProps, 'size'>
> = props => <ButtonText size='lg' {...props} />;

export default ButtonText;
