/**
 * Input — Tekstisyötteen komponentti
 * 
 * Tarkoitus:
 * - Tarjoaa yhtenäinen tekstisyötteen kenttä
 * - Tukee placeholderia ja kustomointia
 * 
 * Käyttö:
 * - <Input placeholder="Kirjoita tähän..." value={text} onChangeText={setText} />
 */

import React from 'react';
import {
    StyleSheet,
    TextInput,
    type TextInputProps,
    View,
} from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';

export interface InputProps extends TextInputProps {}

/**
 * Input komponentti
 * Palauttaa TextInputin teemoitettuna
 */
export function Input({ style, ...rest }: InputProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');

  return (
    <View style={styles.container}>
      <TextInput
        {...rest}
        style={[
          styles.input,
          {
            color: textColor,
            backgroundColor,
            borderColor,
          },
          style,
        ]}
        placeholderTextColor={useThemeColor({}, 'icon')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
  },
});
