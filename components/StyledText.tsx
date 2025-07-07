import { forwardRef } from 'react';
import { Text, TextProps } from 'react-native';

export const StyledText = forwardRef<Text, TextProps>(
  ({ style, className = '', children, ...props }, ref) => {
    // If any font-playfair* class is present, don't add font-playfair; otherwise, add it
    const hasPlayfair = /\bfont-playfair(-[a-z]+)?\b/.test(className);

    const combinedClassName = hasPlayfair
      ? className
      : `tracking-tight font-playfair ${className ? ' ' + className : ''}`;

    return (
      <Text ref={ref} style={style} {...props} className={combinedClassName}>
        {children}
      </Text>
    );
  }
);

StyledText.displayName = 'StyledText';
