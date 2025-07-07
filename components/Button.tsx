import { forwardRef } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

type ButtonProps = {
  textClassName?: string;
} & TouchableOpacityProps;

export const Button = forwardRef<View, ButtonProps>(
  ({ children, textClassName = '', className = '', ...touchableProps }, ref) => {
    return (
      <TouchableOpacity ref={ref} {...touchableProps} className={`bg-black ${className}`}>
        <Text className={`${textClassName}`}>{children}</Text>
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';
