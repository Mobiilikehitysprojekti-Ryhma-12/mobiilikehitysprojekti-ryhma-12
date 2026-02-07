import React from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export function Input(props: TextInputProps & { error?: boolean }) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  const effectiveBorderColor = props.error ? tintColor : borderColor;

  return (
    <TextInput
      {...props}
      placeholderTextColor={props.placeholderTextColor ?? borderColor}
      style={[styles.base, { color: textColor, borderColor: effectiveBorderColor }, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
});
