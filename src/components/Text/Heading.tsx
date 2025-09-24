import React from 'react';
import BaseText from './BaseText';
import { HeadingProps } from '../../types/text';

const Heading: React.FC<HeadingProps> = ({
  level = 1,
  weight = 'bold',
  ...props
}) => {
  const getHeadingSize = (level: number) => {
    switch (level) {
      case 1:
        return 32;
      case 2:
        return 28;
      case 3:
        return 24;
      case 4:
        return 20;
      case 5:
        return 18;
      case 6:
        return 16;
      default:
        return 32;
    }
  };

  return (
    <BaseText weight={weight} fontSize={getHeadingSize(level)} {...props} />
  );
};

// Predefined heading components
export const H1: React.FC<Omit<HeadingProps, 'level'>> = props => (
  <Heading level={1} {...props} />
);

export const H2: React.FC<Omit<HeadingProps, 'level'>> = props => (
  <Heading level={2} {...props} />
);

export const H3: React.FC<Omit<HeadingProps, 'level'>> = props => (
  <Heading level={3} {...props} />
);

export const H4: React.FC<Omit<HeadingProps, 'level'>> = props => (
  <Heading level={4} {...props} />
);

export const H5: React.FC<Omit<HeadingProps, 'level'>> = props => (
  <Heading level={5} {...props} />
);

export const H6: React.FC<Omit<HeadingProps, 'level'>> = props => (
  <Heading level={6} {...props} />
);

export default Heading;
