import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ButtonProps } from '../types';

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
}) => {
  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[`size_${size}`],
    disabled && styles.disabled,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_size_${size}`],
    disabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#6366f1'} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  // Variants
  primary: {
    backgroundColor: '#6366f1',
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: '#f3f4f6',
    borderWidth: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  // Sizes
  size_small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  size_medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  size_large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56,
  },
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  text_primary: {
    color: '#ffffff',
  },
  text_secondary: {
    color: '#374151',
  },
  text_outline: {
    color: '#6366f1',
  },
  text_size_small: {
    fontSize: 14,
  },
  text_size_medium: {
    fontSize: 16,
  },
  text_size_large: {
    fontSize: 18,
  },
  // Disabled states
  disabled: {
    opacity: 0.6,
    backgroundColor: '#d1d5db',
  },
  textDisabled: {
    color: '#9ca3af',
  },
});

export default Button;