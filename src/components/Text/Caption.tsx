import React from 'react';
import BaseText from './BaseText';
import { CaptionProps } from '../../types/text';

const Caption: React.FC<CaptionProps> = ({ 
  variant = 'regular',
  muted = true,
  size = 'xs',
  ...props 
}) => {
  const getWeight = (variant: string) => {
    switch (variant) {
      case 'bold': return 'bold';
      default: return 'regular';
    }
  };

  return (
    <BaseText
      weight={getWeight(variant)}
      size={size}
      muted={muted}
      {...props}
    />
  );
};

// Predefined caption components
export const CaptionText: React.FC<Omit<CaptionProps, 'variant'>> = (props) => (
  <Caption variant="regular" {...props} />
);

export const CaptionBold: React.FC<Omit<CaptionProps, 'variant'>> = (props) => (
  <Caption variant="bold" {...props} />
);

// Helper text component
export const HelperText: React.FC<Omit<CaptionProps, 'variant'>> = (props) => (
  <Caption variant="regular" muted={true} {...props} />
);

// Error text component
export const ErrorText: React.FC<Omit<CaptionProps, 'variant'>> = (props) => (
  <Caption variant="regular" variant="error" muted={false} {...props} />
);

export default Caption;
