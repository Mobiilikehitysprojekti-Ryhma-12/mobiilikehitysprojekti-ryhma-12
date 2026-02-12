/**
 * Button — Painike-komponentti
 * 
 * Tarkoitus:
 * - Tarjoaa yhtenäisen painikepyynnin koko sovelluksessa
 * - Tukee disabled-tilan ja loading-indikaatoria
 * - Käyttää teemoitusta väreille
 * 
 * Käyttö:
 * - <Button title="Klikkaa" onPress={() => {}} />
 * - <Button title="Olematon" disabled={true} />
 * - <Button title="Lähettää..." loading={true} />
 */

import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    type TouchableOpacityProps,
} from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Button komponentti
 * Palauttaa painikkeen (TouchableOpacity + Text)
 * Tukee loading-tilaa (näyttää spinner)
 */
export function Button({
  title,
  disabled = false,
  loading = false,
  style,
  ...rest
}: ButtonProps) {
  const tintColor = useThemeColor({}, 'tint');

  return (
    <TouchableOpacity
      {...rest}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: tintColor, opacity: disabled || loading ? 0.5 : 1 },
        style,
      ]}
      activeOpacity={disabled || loading ? 1 : 0.7}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, { color: '#fff' }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
  },
});
