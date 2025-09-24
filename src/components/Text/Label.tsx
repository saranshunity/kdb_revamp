import React from 'react';
import BaseText from './BaseText';
import { LabelProps } from '../../types/text';

const Label: React.FC<LabelProps> = ({
  required = false,
  error = false,
  weight = 'medium',
  size = 'sm',
  ...props
}) => {
  const getColor = () => {
    if (error) return 'error';
    return 'text.primary';
  };

  return (
    <BaseText weight={weight} size={size} color={getColor()} {...props}>
      {props.children}
      {required && (
        <BaseText color='error' size='sm'>
          {' *'}
        </BaseText>
      )}
    </BaseText>
  );
};

// Predefined label components
export const FormLabel: React.FC<Omit<LabelProps, 'required'>> = props => (
  <Label required={true} {...props} />
);

export const ErrorLabel: React.FC<Omit<LabelProps, 'error'>> = props => (
  <Label error={true} {...props} />
);

export const OptionalLabel: React.FC<Omit<LabelProps, 'required'>> = props => (
  <Label required={false} {...props} />
);

export default Label;
