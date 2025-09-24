import React from 'react';
import BaseText from './BaseText';
import { BodyProps } from '../../types/text';

const Body: React.FC<BodyProps> = ({
  variant = 'regular',
  size = 'md',
  ...props
}) => {
  const getWeight = (variant: string) => {
    switch (variant) {
      case 'medium':
        return 'medium';
      case 'bold':
        return 'bold';
      default:
        return 'regular';
    }
  };

  return <BaseText weight={getWeight(variant)} size={size} {...props} />;
};

// Predefined body text components
export const BodyText: React.FC<Omit<BodyProps, 'variant'>> = props => (
  <Body variant='regular' {...props} />
);

export const BodyMedium: React.FC<Omit<BodyProps, 'variant'>> = props => (
  <Body variant='medium' {...props} />
);

export const BodyBold: React.FC<Omit<BodyProps, 'variant'>> = props => (
  <Body variant='bold' {...props} />
);

// Small text variants
export const SmallText: React.FC<Omit<BodyProps, 'size'>> = props => (
  <Body size='sm' {...props} />
);

export const LargeText: React.FC<Omit<BodyProps, 'size'>> = props => (
  <Body size='lg' {...props} />
);

export default Body;
