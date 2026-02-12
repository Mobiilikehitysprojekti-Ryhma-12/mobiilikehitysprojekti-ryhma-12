/**
 * ThemedText — Teemattu teksti -komponentti
 * 
 * Tarkoitus:
 * - Tarjoaa teemaa noudattavat tekstikomponentit
 * - Tukee erityyppisiä tekstejä (title, default)
 * - Yhdistää FontSize-, väri- ja muita tyylit automaattisesti
 * 
 * Käyttö:
 * - <ThemedText type="title">Otsikko</ThemedText>
 * - <ThemedText>Normaali teksti</ThemedText>
 */

import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useThemeColor } from '../hooks/use-theme-color';

export interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'subtitle' | 'link';
}

/**
 * ThemedText komponentti
 * Palauttaa Text-komponentin, joka käyttää teemaa väreille ja tyyleille
 */
export function ThemedText({
  style,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({}, 'text');

  return (
    <Text
      {...rest}
      style={[
        { color },
        type === 'title' && { fontSize: 28, fontWeight: 'bold' },
        type === 'subtitle' && { fontSize: 16, fontWeight: '600' },
        type === 'link' && { color: '#0a7ea4' },
        style,
      ]}
    />
  );
}
